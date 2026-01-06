import { map, Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecuteSnipetDto } from "../dto/execute-snipet.dto";
import { ExecutionEvent } from "../types/execution-event";
import { OutputParserStrategy } from "./output-parser.types";
import { Inject, Injectable } from "@nestjs/common";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { PromptService } from "@snipet/nest-prompt";
import { PromptTemplates } from "@/@generated/prompts/prompts";
import { SnipetIntent } from "@/types/snipet-intent";

export type AnswerOutput = {
  answer: string;
}

@Injectable()
export class AnswerOutputStrategy implements OutputParserStrategy<AnswerOutput> {
  intent = SnipetIntent.ANSWER;

  @Inject() private readonly promptService: PromptService<typeof PromptTemplates>;
  @Inject() private readonly llmManager: LLMManagerService;

  async execute(
    executeSnipet: ExecuteSnipetDto,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>,
  ): Promise<AnswerOutput> {
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new Error('No text provider available for answer generation');
    
    const prompt = this.promptService.getTemplate("AnswerQuestion").build({
      question: executeSnipet.query,
      knowledgeMemories: context.knowledge.map(k => k.content),
      snipetMemories: context.snipet.map(s => ({ content: s.content, role: s.metadata.role ?? "assistant" }))
    });
  
    if (executeSnipet.stream) {
      const stream = await textProvider.observableStream({
        prompt,
        maxTokens: executeSnipet.options?.output?.maxTokens,
        temperature: executeSnipet.options?.output?.temperature,
      });

      let answer = "";

      return await new Promise<AnswerOutput>((resolve, reject) => {
        const subscription = stream.subscribe({
          next: chunk => {
            answer += chunk.data;
            subscriber.next({ event: "output.streaming", payload: { answer: chunk.data } });
          },
          error: err => {
            subscriber.error(err);
            subscription.unsubscribe();
            reject(err);
          },
          complete: () => {
            subscriber.next({ event: "output.finish" });
            subscriber.complete();
            resolve({ answer });
          }
        });

        subscriber.add(() => subscription.unsubscribe());
      });
    } else {
      const generateResponse = await textProvider.generate({
        prompt,
        maxTokens: executeSnipet.options?.output?.maxTokens,
        temperature: executeSnipet.options?.output?.temperature,
      });
      const res: AnswerOutput = { answer: generateResponse.output };
      subscriber.next({ event: "output.data", payload: res });
      subscriber.next({ event: "output.finish" });
      return res;
    }
  }
}