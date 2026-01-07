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

export type ExpandOutput = {
  intent: SnipetIntent.EXPAND;
  expandedText: string;
}

@Injectable()
export class ExpandOutputStrategy implements OutputParserStrategy<ExpandOutput> {
  intent = SnipetIntent.EXPAND;

  @Inject() private readonly promptService: PromptService<typeof PromptTemplates>;
  @Inject() private readonly llmManager: LLMManagerService;

  async execute(
    executeSnipet: ExecuteSnipetDto,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>,
  ): Promise<ExpandOutput> {
    const textProvider = await this.llmManager.getTextProvider();
    if (!textProvider) throw new Error('No text provider available for answer generation');
    
    const prompt = this.promptService.getTemplate("Expand").build({ text: executeSnipet.query });
  
    if (executeSnipet.stream) {
      const stream = await textProvider.observableStream({
        prompt,
        maxTokens: executeSnipet.options?.output?.maxTokens,
        temperature: executeSnipet.options?.output?.temperature,
      });

      let expandedText = "";

      return await new Promise<ExpandOutput>((resolve, reject) => {
        const subscription = stream.subscribe({
          next: chunk => {
            expandedText += chunk.data;
            subscriber.next({ event: "output.streaming", payload: { chunk: chunk.data } });
          },
          error: err => {
            subscriber.error(err);
            subscription.unsubscribe();
            reject(err);
          },
          complete: () => {
            subscriber.next({ event: "output.finish" });
            subscriber.complete();
            resolve({ intent: SnipetIntent.EXPAND, expandedText });
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
      const res: ExpandOutput = { intent: SnipetIntent.EXPAND, expandedText: generateResponse.output };
      subscriber.next({ event: "output.data", payload: res });
      subscriber.next({ event: "output.finish" });
      return res;
    }
  }
}