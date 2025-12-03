import { EntityManager, Repository } from "typeorm";

import { PromptTemplates } from "@/@generated/prompts/prompts";
import {
  SessionContextEntity, SessionContextState, SessionEntity, SessionMessageEntity, SessionMessageRole
} from "@/entities";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Service } from "@/shared/service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PromptService } from "@snipet/nest-prompt";

import { SessionMemoryService } from "../memory/session-memory/session-memory.service";
import { SourceMemoryService } from "../memory/source-memory/source-memory.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SendMessageDto } from "./dto/send-message.dto";

export type FindOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
  forceUsePlugins?: string[]; // list of plugin ids
  excludePlugins?: string[]; // list of plugin ids
}

export type Finder = (...args: any[]) => Partial<FindOptions>;

@Injectable()
export class SessionService extends Service<SessionEntity> {
  logger = new Logger(SessionService.name);
  entity = SessionEntity;


  constructor(
    private readonly sessionMemory: SessionMemoryService,
    private readonly promptService: PromptService<typeof PromptTemplates>,
    private readonly sourceMemory:  SourceMemoryService,
    private readonly llmManager:    LLMManagerService
  ) {
    super();
  }

  sessionContextRepository(manager?: EntityManager): Repository<SessionContextEntity> {
    return manager ?
      manager.getRepository(SessionContextEntity) :
      this.dataSource.getRepository(SessionContextEntity);
  }

  sessionMessageRepository(manager?: EntityManager): Repository<SessionMessageEntity> {
    return manager ?
      manager.getRepository(SessionMessageEntity) :
      this.dataSource.getRepository(SessionMessageEntity);
  }

  override async create(input: CreateSessionDto, manager?: EntityManager): Promise<SessionEntity>;
  override async create(input: CreateSessionDto[], manager?: EntityManager): Promise<SessionEntity[]>;
  override async create(
    input: CreateSessionDto | CreateSessionDto[],
    manager?: EntityManager
  ): Promise<SessionEntity | SessionEntity[]> {
    return await this.transaction(async (manager) => {
      const isArray = Array.isArray(input);
      const inputArray = isArray ? input : [input];

      const sessions: SessionEntity[] = [];
      for (const input of inputArray) {
        const session = await this.repository(manager).save(new SessionEntity(input));
        session.context = new SessionContextEntity({ sessionId: session.id });
        await this.sessionContextRepository(manager).save(session.context);
        sessions.push(session);
      }
      return isArray ? sessions : sessions[0];
    }, manager);
  }

  private async getSessionAndLLM(sessionId: string, manager?: EntityManager) {
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new NotFoundException("LLM not found");

    const session = await this.repository(manager).findOne({
      where: { id: sessionId },
      relations: ["context"]
    });
    if (!session) throw new NotFoundException("Session not found");

    return {
      session,
      llm: textProvider
    }
  }

  private async saveUserMessage(message: string, sessionId: string, knowledgeId: string, manager?: EntityManager) {
    const userMessage = await this.sessionMessageRepository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.USER,
      sessionId
    }));

    await this.sessionMemory.add(knowledgeId, userMessage);
    return userMessage;
  }

  private async saveAssistantMessage(message: string, sessionId: string, knowledgeId: string, manager?: EntityManager) {
    const assistantMessage = await this.sessionMessageRepository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.ASSISTANT,
      sessionId
    }));

    await this.sessionMemory.add(knowledgeId, assistantMessage);
    return assistantMessage;
  }
  private async updateSessionContextState(sessionId: string, state: SessionContextState, manager?: EntityManager) {
    return this.sessionContextRepository(manager).update({ sessionId }, { state });  
  }

  async sendMessage(
    { message, sessionId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<SessionMessageEntity> {
    try {
      const { llm } = await this.getSessionAndLLM(sessionId, manager);
      await this.updateSessionContextState(sessionId, SessionContextState.GENERATING, manager);
      await this.saveUserMessage(message, sessionId, knowledgeId, manager);
      
      const sessionSearchResult = await this.sessionMemory.search(
        knowledgeId,
        sessionId,
        SessionMemoryService.withSearchQuery(message)
      );
  
      const sourceSearchResult = await this.sourceMemory.find(knowledgeId, message);
      
      const answerPrompt = this.promptService.getTemplate("AnwserQuestion").build({
        question: message,
        recentMessages: sessionSearchResult.lastNMessages.map(f => ({ role: f.role, content: f.content })),
        relevantMessages: sessionSearchResult.searchQuery.map(f => ({ content: f.content, role: f.role })),
        retrievedFragments: sourceSearchResult
          .map(f => (`${f.content} {sourceId:${f.id}}`))
      });
      
      const llmResponse = await llm.generate({ prompt: answerPrompt });
  
      return await this.saveAssistantMessage(llmResponse.output, sessionId, knowledgeId, manager);
    } finally {
      await this.updateSessionContextState(sessionId, SessionContextState.IDLE, manager);
    }
  }

  async *sendMessageStream(
    { message, sessionId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): AsyncIterable<string> {
    const { llm } = await this.getSessionAndLLM(sessionId, manager);
    await this.updateSessionContextState(sessionId, SessionContextState.GENERATING, manager);

    await this.saveUserMessage(message, sessionId, knowledgeId, manager);

    const sessionSearchResult = await this.sessionMemory.search(
      knowledgeId,
      sessionId,
      SessionMemoryService.withSearchQuery(message)
    );

    const sourceSearchResult = await this.sourceMemory.find(knowledgeId, message);
    
    const answerPrompt = this.promptService.getTemplate("AnwserQuestion").build({
      question: message,
      recentMessages: sessionSearchResult.lastNMessages.map(f => ({ role: f.role, content: f.content })),
      relevantMessages: sessionSearchResult.searchQuery.map(f => ({ content: f.content, role: f.role })),
      retrievedFragments: sourceSearchResult
        .map(f => (`${f.content} {sourceId:${f.id}}`))
    });
    
    const stream = llm.iterableStream({ prompt: answerPrompt });
    const self = this;
    return (async function* () {
      let full = "";
      for await (const chunk of stream) {
        full += chunk;
        yield chunk;
      }
      
      await self.saveAssistantMessage(full, sessionId, knowledgeId, manager);
    })()
  }
}