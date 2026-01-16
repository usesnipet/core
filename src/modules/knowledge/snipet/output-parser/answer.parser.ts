import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecutionEvent } from "../types/execution-event";
import { Inject, Injectable } from "@nestjs/common";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { PromptService } from "@snipet/nest-prompt";
import { PromptTemplates } from "@/@generated/prompts/prompts";
import { SnipetIntent } from "@/types/snipet-intent";
import { BaseOutputResult, OutputParserStrategy } from "./types";
import { ExecutionEntity } from "@/entities/execution.entity";

export type AnswerOutput = BaseOutputResult & {
  intent: SnipetIntent.ANSWER;
  answer: string;
}

@Injectable()
export class AnswerOutputStrategy implements OutputParserStrategy<AnswerOutput> {
  intent = SnipetIntent.ANSWER;

  @Inject() private readonly promptService: PromptService<typeof PromptTemplates>;
  @Inject() private readonly llmManager: LLMManagerService;

  async execute(
    execution: ExecutionEntity,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>,
  ): Promise<AnswerOutput> {
    const startDate = new Date();
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new Error('No text provider available for answer generation');

    const info = await textProvider.info();

    const prompt = this.promptService.getTemplate("AnswerQuestion").build({
      question: execution.options.query,
      knowledgeMemories: context.knowledge.map(k => k.content),
      snipetMemories: context.snipet.map(s => ({ content: s.content, role: s.metadata.role ?? "assistant" }))
    });

    let res: AnswerOutput = {
      intent: SnipetIntent.ANSWER,
      modelInfo: info,
    } as AnswerOutput;

    if (execution.options.stream) {
      const stream = await textProvider.stream({
        prompt,
        maxTokens: execution.options?.output?.maxTokens,
        temperature: execution.options?.output?.temperature,
      });

      const chunks: string[] = [];

      await new Promise<void>((resolve, reject) => {
        const subscription = stream.subscribe({
          next: chunk => {
            chunks.push(chunk.data as string);
            subscriber.next({ event: "output.streaming", payload: { chunk: chunk.data } });
          },
          error: reject,
          complete: () => {
            res.answer = chunks.join("");
            res.tokens = {
              input: textProvider.countTokens(execution.options.query),
              prompt: textProvider.countTokens(prompt),
              output: textProvider.countTokens(res.answer)
            }

            resolve();
          }
        });
        subscriber.add(() => subscription.unsubscribe());
      });
    } else {
      const generateResponse = await textProvider.generate({
        prompt,
        maxTokens: execution.options?.output?.maxTokens,
        temperature: execution.options?.output?.temperature,
      });
      res.tokens = {
        input: textProvider.countTokens(execution.options.query),
        prompt: generateResponse.tokensIn,
        output: generateResponse.tokensOut
      }
      res.answer = generateResponse.output;
    }

    res.time = { start: startDate, end: new Date() };

    subscriber.next({ event: "output.data", payload: res });
    subscriber.next({ event: "output.finish" });

    return res;
  }
}