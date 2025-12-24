import { PromptTemplates } from "@/@generated/prompts/prompts";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { KnowledgeService } from "@/modules/knowledge/knowledge.service";
import { Service } from "@/shared/service";
import { Injectable, Logger, MessageEvent, NotFoundException } from "@nestjs/common";
import { PromptService } from "@snipet/nest-prompt";
import { finalize, Observable, tap } from "rxjs";
import { EntityManager } from "typeorm";

import { SourceMemoryService } from "../../../memory/source-memory/source-memory.service";

import { SendMessageDto } from "./dto/send-message.dto";
import { SnipetService } from "../snipet.service";
import { SnipetMessageEntity, SnipetMessageRole } from "@/entities";
import { SnipetMemoryService } from "@/modules/memory/snipet-memory/snipet-memory.service";

export type FindOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
  forceUsePlugins?: string[]; // list of plugin ids
  excludePlugins?: string[]; // list of plugin ids
}

export type Finder = (...args: any[]) => Partial<FindOptions>;

@Injectable()
export class SnipetMessageService extends Service<SnipetMessageEntity> {
  logger = new Logger(SnipetMessageService.name);
  entity = SnipetMessageEntity;

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly snipetService: SnipetService,
    private readonly snipetMemory: SnipetMemoryService,
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
  private async checkSnipetExists(snipetId: string, manager?: EntityManager) {
    const Snipet = await this.snipetService.findByID(snipetId, { manager });
    if (!Snipet) throw new NotFoundException("Snipet not found");
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
    snipetId: string,
    knowledgeId: string,
    manager?: EntityManager
  ) {
    const userMessage = await this.repository(manager).save(new SnipetMessageEntity({
      content: message,
      role: SnipetMessageRole.USER,
      snipetId,
      knowledgeId
    }));

    await this.snipetMemory.add(knowledgeId, userMessage);
    return userMessage;
  }

  private async saveAssistantMessage(
    message: string,
    snipetId: string,
    knowledgeId: string,
    manager?: EntityManager
  ) {
    const assistantMessage = await this.repository(manager).save(new SnipetMessageEntity({
      content: message,
      role: SnipetMessageRole.ASSISTANT,
      snipetId,
      knowledgeId
    }));

    await this.snipetMemory.add(knowledgeId, assistantMessage);
    return assistantMessage;
  }
  //#endregion

  private async buildPrompt({ content: message, snipetId, knowledgeId }: SendMessageDto) {
    const [ SnipetSearchResult, sourceSearchResult ] = await Promise.all([
      this.snipetMemory.search(
        knowledgeId,
        snipetId,
        SnipetMemoryService.withSearchQuery(message)
      ),
      this.sourceMemory.search(knowledgeId, message)
    ])

    return this.promptService.getTemplate("AnswerQuestion").build({
      question: message,
      recentMessages: SnipetSearchResult.lastNMessages.map(f => ({ role: f.role, content: f.content })),
      relevantMessages: SnipetSearchResult.searchQuery.map(f => ({ content: f.content, role: f.role })),
      retrievedFragments: sourceSearchResult.map(f => f.content)
    });
  }

  async sendMessage(
    { content: message, snipetId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<SnipetMessageEntity> {
    await this.checkSnipetExists(snipetId, manager);
    await this.checkKnowledgeExists(knowledgeId, manager);

    const llm = await this.getLLM();
    await this.saveUserMessage(message, snipetId, knowledgeId, manager);

    const llmResponse = await llm.generate({
      prompt: await this.buildPrompt({ knowledgeId, content: message, snipetId })
    });

    return await this.saveAssistantMessage(llmResponse.output, snipetId, knowledgeId, manager);
  }

  async sendMessageStream(
    { content: message, snipetId, knowledgeId }: SendMessageDto,
    manager?: EntityManager
  ): Promise<Observable<MessageEvent>> {
    await this.checkSnipetExists(snipetId, manager);
    await this.checkKnowledgeExists(knowledgeId, manager);
    const llm = await this.getLLM();
    
    await this.saveUserMessage(message, snipetId, knowledgeId, manager);
    const prompt = await this.buildPrompt({ knowledgeId, content: message, snipetId });

    return llm.observableStream({ prompt });
  }
}