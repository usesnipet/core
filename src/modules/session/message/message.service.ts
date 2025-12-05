import { finalize, Observable, tap } from "rxjs";
import { EntityManager } from "typeorm";

import { PromptTemplates } from "@/@generated/prompts/prompts";
import { SessionContextState, SessionMessageEntity, SessionMessageRole } from "@/entities";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { KnowledgeService } from "@/modules/knowledge/knowledge.service";
import { Service } from "@/shared/service";
import { Injectable, Logger, MessageEvent, NotFoundException } from "@nestjs/common";
import { PromptService } from "@snipet/nest-prompt";

import { SessionMemoryService } from "../../memory/session-memory/session-memory.service";
import { SourceMemoryService } from "../../memory/source-memory/source-memory.service";
import { SessionService } from "../session.service";
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
export class SessionMessageService extends Service<SessionMessageEntity> {
  logger = new Logger(SessionMessageService.name);
  entity = SessionMessageEntity;

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly sessionService: SessionService,
    private readonly sessionMemory: SessionMemoryService,
    private readonly promptService: PromptService<typeof PromptTemplates>,
    private readonly sourceMemory:  SourceMemoryService,
    private readonly llmManager:    LLMManagerService
  ) {
    super();
  }

  //#region check exists
  private async checkKnowledgeExists(knowledgeId: string, manager?: EntityManager) {
    const knowledge = await this.knowledgeService.findByID(knowledgeId, { manager });
    if (!knowledge) throw new NotFoundException("Knowledge not found");
  }
  private async checkSessionExists(sessionId: string, manager?: EntityManager) {
    const session = await this.sessionService.findByID(sessionId, { manager });
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
    const userMessage = await this.repository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.USER,
      sessionId,
      knowledgeId
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
    const assistantMessage = await this.repository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.ASSISTANT,
      sessionId,
      knowledgeId
    }));

    await this.sessionMemory.add(knowledgeId, assistantMessage);
    return assistantMessage;
  }
  //#endregion

  private async buildPrompt({ content: message, sessionId, knowledgeId }: SendMessageDto) {
    const [ sessionSearchResult, sourceSearchResult ] = await Promise.all([
      this.sessionMemory.search(
        knowledgeId,
        sessionId,
        SessionMemoryService.withSearchQuery(message)
      ),
      this.sourceMemory.search(knowledgeId, message)
    ])

    return this.promptService.getTemplate("AnswerQuestion").build({
      question: message,
      recentMessages: sessionSearchResult.lastNMessages.map(f => ({ role: f.role, content: f.content })),
      relevantMessages: sessionSearchResult.searchQuery.map(f => ({ content: f.content, role: f.role })),
      retrievedFragments: sourceSearchResult.map(f => f.content)
    });
  }

  async sendMessage(
    { content: message, sessionId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<SessionMessageEntity> {
    try {
      await this.checkSessionExists(sessionId, manager);
      await this.checkKnowledgeExists(knowledgeId, manager);

      const llm = await this.getLLM();
      await this.sessionService.updateSessionContextState(
        sessionId,
        SessionContextState.GENERATING,
        manager
      );
      await this.saveUserMessage(message, sessionId, knowledgeId, manager);

      const llmResponse = await llm.generate({
        prompt: await this.buildPrompt({ knowledgeId, content: message, sessionId })
      });

      return await this.saveAssistantMessage(llmResponse.output, sessionId, knowledgeId, manager);
    } finally {
      await this.sessionService.updateSessionContextState(
        sessionId,
        SessionContextState.IDLE,
        manager
      );
    }
  }

  async sendMessageStream(
    { content: message, sessionId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<Observable<MessageEvent>> {
    await this.checkSessionExists(sessionId, manager);
    await this.checkKnowledgeExists(knowledgeId, manager);
    const llm = await this.getLLM();
    await this.sessionService.updateSessionContextState(
      sessionId,
      SessionContextState.GENERATING,
      manager
    );
    await this.saveUserMessage(message, sessionId, knowledgeId, manager);
    const prompt = await this.buildPrompt({ knowledgeId, content: message, sessionId });

    const observableStream = await llm.observableStream({ prompt });

    const self = this;
    let full = "";
    return observableStream.pipe(
      tap(e => full += e.data),
      finalize(async () => {
        await self.sessionService.updateSessionContextState(
          sessionId,
          SessionContextState.IDLE,
          manager
        );
        await self.saveAssistantMessage(full, sessionId, knowledgeId, manager);
      })
    )
  }
}