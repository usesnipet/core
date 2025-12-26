import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SnipetContext, SnipetInput, SnipetOutput, SnipetRuntime } from "../snipet.types";
import { SnipetMemoryEntity } from "@/entities/snipet-memory.entity";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { SnipetMemoryService } from "../snipet-memory.service";
import { KnowledgeService } from "../../knowledge.service";
import { PromptService } from "@snipet/nest-prompt";
import { PromptTemplates } from "@/@generated/prompts/prompts";

export type ChatRuntimeInput = {
  userMessage: string;
}
export type ChatRuntimeOutput = {
  aiResponse: string;
}

@Injectable()
export class ChatRuntime implements SnipetRuntime<ChatRuntimeInput, ChatRuntimeOutput> {
  @Inject() private readonly llmManager: LLMManagerService;
  @Inject() private readonly snipetMemory: SnipetMemoryService;
  @Inject() private readonly knowledgeService: KnowledgeService;
  @Inject() private readonly promptService: PromptService<typeof PromptTemplates>;

  private async getLLM() {
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new NotFoundException("LLM not found");
    return textProvider;
  }

  private async buildPrompt(knowledgeId: string, snipetId: string, message: string) {
    const [ snipetSearchResult, sourceSearchResult ] = await Promise.all([
      this.snipetMemory.search(
        knowledgeId,
        snipetId,
        SnipetMemoryService.withSearchQuery(message)
      ),
      this.knowledgeService.search(knowledgeId, message)
    ])

    return this.promptService.getTemplate("AnswerQuestion").build({
      question: message,
      recentMessages: snipetSearchResult.lastNMemories.map(f => ({ role: f.type, content: f.payload })),
      relevantMessages: snipetSearchResult.searchQuery.map(f => ({ content: f.content, role: f.metadata.role })),
      retrievedFragments: sourceSearchResult.map(f => f.content)
    });
  }

  async execute(
    input: SnipetInput<ChatRuntimeInput>,
    context: SnipetContext
  ): Promise<SnipetOutput<ChatRuntimeOutput>> {
    const llm = await this.getLLM();
    const knowledgeId = context.snipet.knowledgeId;
    const snipetId = context.snipet.id;
    const userMessage = input.payload.userMessage;
    await this.snipetMemory.create(
      new SnipetMemoryEntity({
        knowledgeId,
        snipetId,
        payload: { text: userMessage, role: "user" },
        type: "chat",
      })
    )
    const llmResponse = await llm.generate({
      prompt: await this.buildPrompt(knowledgeId, snipetId, userMessage)
    });

    await this.snipetMemory.create(new SnipetMemoryEntity({
      knowledgeId,
      snipetId,
      payload: { text: llmResponse.output, role: "assistant" },
      type: "chat",
    }));

    return { aiResponse: llmResponse.output };
  }
}