import { finalize, Observable, tap } from "rxjs";
import { EntityManager, Repository } from "typeorm";

import { PromptTemplates } from "@/@generated/prompts/prompts";
import {
  KnowledgeEntity, SessionContextEntity, SessionContextState, SessionEntity, SessionMessageEntity,
  SessionMessageRole
} from "@/entities";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Service } from "@/shared/service";
import { Injectable, Logger, MessageEvent, NotFoundException } from "@nestjs/common";
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

  //#region repositories
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
  knowledgeRepository(manager?: EntityManager): Repository<KnowledgeEntity> {
    return manager ?
      manager.getRepository(KnowledgeEntity) :
      this.dataSource.getRepository(KnowledgeEntity);
  }
  //#endregion

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

  //#region check exists
  private async checkKnowledgeExists(knowledgeId: string, manager?: EntityManager) {
    const knowledge = await this.knowledgeRepository(manager).findOne({ where: { id: knowledgeId } });
    if (!knowledge) throw new NotFoundException("Knowledge not found");
  }
  private async checkSessionExists(sessionId: string, manager?: EntityManager) {
    const session = await this.repository(manager).findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");
  }
  //#endregion

  private async getLLM() {
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new NotFoundException("LLM not found");
    return textProvider;
  }

  //#region save message
  private async saveUserMessage(
    message: string,
    sessionId: string,
    knowledgeId: string,
    manager?: EntityManager
  ) {
    const userMessage = await this.sessionMessageRepository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.USER,
      sessionId
    }));

    await this.sessionMemory.add(knowledgeId, userMessage);
    return userMessage;
  }

  private async saveAssistantMessage(
    message: string,
    sessionId: string,
    knowledgeId: string,
    manager?: EntityManager
  ) {
    const assistantMessage = await this.sessionMessageRepository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.ASSISTANT,
      sessionId
    }));

    await this.sessionMemory.add(knowledgeId, assistantMessage);
    return assistantMessage;
  }
  //#endregion

  private async updateSessionContextState(
    sessionId: string,
    state: SessionContextState,
    manager?: EntityManager
  ) {
    return this.sessionContextRepository(manager).update({ sessionId }, { state });
  }

  private async buildPrompt({ message, sessionId, knowledgeId }: SendMessageDto) {
    const [ sessionSearchResult, sourceSearchResult ] = await Promise.all([
      this.sessionMemory.search(
        knowledgeId,
        sessionId,
        SessionMemoryService.withSearchQuery(message)
      ),
      this.sourceMemory.find(knowledgeId, message)
    ])

    return this.promptService.getTemplate("AnswerQuestion").build({
      question: message,
      recentMessages: sessionSearchResult.lastNMessages.map(f => ({ role: f.role, content: f.content })),
      relevantMessages: sessionSearchResult.searchQuery.map(f => ({ content: f.content, role: f.role })),
      retrievedFragments: sourceSearchResult.map(f => f.content)
    });
  }

  async sendMessage(
    { message, sessionId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<SessionMessageEntity> {
    try {
      await this.checkSessionExists(sessionId, manager);
      await this.checkKnowledgeExists(knowledgeId, manager);

      const llm = await this.getLLM();
      await this.updateSessionContextState(sessionId, SessionContextState.GENERATING, manager);
      await this.saveUserMessage(message, sessionId, knowledgeId, manager);

      const llmResponse = await llm.generate({
        prompt: await this.buildPrompt({ knowledgeId, message, sessionId })
      });

      return await this.saveAssistantMessage(llmResponse.output, sessionId, knowledgeId, manager);
    } finally {
      await this.updateSessionContextState(sessionId, SessionContextState.IDLE, manager);
    }
  }

  async sendMessageStream(
    { message, sessionId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<Observable<MessageEvent>> {
    await this.checkSessionExists(sessionId, manager);
    await this.checkKnowledgeExists(knowledgeId, manager);
    const llm = await this.getLLM();
    await this.updateSessionContextState(sessionId, SessionContextState.GENERATING, manager);
    await this.saveUserMessage(message, sessionId, knowledgeId, manager);
    const prompt = await this.buildPrompt({ knowledgeId, message, sessionId });

    const observableStream = await llm.observableStream({ prompt });
    
    const self = this;
    let full = "";
    return observableStream.pipe(
      tap(e => full += e.data),
      finalize(async () => {
        await self.updateSessionContextState(sessionId, SessionContextState.IDLE, manager);
        await self.saveAssistantMessage(full, sessionId, knowledgeId, manager);
      })
    )
  }
}