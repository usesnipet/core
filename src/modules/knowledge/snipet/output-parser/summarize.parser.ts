import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecuteSnipetDto } from "../dto/execute-snipet.dto";
import { ExecutionEvent } from "../types/execution-event";
import { SnipetIntent } from "@/types/snipet-intent";
import { OutputParserStrategy } from "./output-parser.types";
import { Inject, Injectable } from "@nestjs/common";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { PromptService } from "@snipet/nest-prompt";
import { PromptTemplates } from "@/@generated/prompts/prompts";

export type SummarizeOutput = {
  intent: SnipetIntent.SUMMARIZE;
  summary: string;
}

@Injectable()
export class SummarizeOutputStrategy implements OutputParserStrategy<SummarizeOutput> {
  intent = SnipetIntent.SUMMARIZE;

  @Inject() private readonly promptService: PromptService<typeof PromptTemplates>;
  @Inject() private readonly llmManager: LLMManagerService;

  async execute(
    executeSnipet: ExecuteSnipetDto,
    _: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>,
  ): Promise<SummarizeOutput> {
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new Error('No text provider available for answer generation');
    
    const prompt = this.promptService.getTemplate("Summary").build({
      text: executeSnipet.query,
    });
  
    if (executeSnipet.stream) {
      const stream = await textProvider.observableStream({
        prompt,
        maxTokens: executeSnipet.options?.output?.maxTokens,
        temperature: executeSnipet.options?.output?.temperature,
      });

      let summary = "";

      return await new Promise<SummarizeOutput>((resolve, reject) => {
        const subscription = stream.subscribe({
          next: chunk => {
            summary += chunk.data;
            subscriber.next({ event: "output.streaming", payload: { chunk: chunk.data } });
          },
          error: err => {
            subscriber.error(err);
            subscription.unsubscribe();
            reject(err);
          },
          complete: () => {
            const res: SummarizeOutput = { intent: SnipetIntent.SUMMARIZE, summary };
            subscriber.next({ event: "output.data", payload: res });
            subscriber.next({ event: "output.finish" });
            subscriber.complete();
            resolve(res);
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
      const res: SummarizeOutput = { intent: SnipetIntent.SUMMARIZE, summary: generateResponse.output };
      subscriber.next({ event: "output.data", payload: res });
      subscriber.next({ event: "output.finish" });
      return res;
    }
  }
}