import { Config, Ollama } from "ollama";
import { output, ZodObject } from "zod";
import { Observable } from "rxjs";
import { MessageEvent } from "@nestjs/common";

import { ProviderHealth, ProviderInfo } from "../types";
import { GenerateParams, AIResult, TextProvider } from "./base";
import { BaseTextLLMConfig } from "@/types";

type OllamaOptions = BaseTextLLMConfig<Partial<Config>>;

export class OllamaTextAdapter extends TextProvider {
  private client: Ollama;

  constructor(private config: OllamaOptions) {
    super();
    this.client = new Ollama(config.opts);
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.config.model };
  }

  async generate(params: GenerateParams): Promise<AIResult> {
    const start = Date.now();
    const { prompt, maxTokens, temperature } = params;

    const res = await this.client.chat({
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
      options: {
        temperature,
        num_predict: maxTokens
      }
    });

    const text = res.message?.content ?? "";
    const inputTokens = res.prompt_eval_count;
    const outputTokens = res.eval_count;

    return {
      output: text,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      },
      cost: null,
      latency: Date.now() - start,
      model: res.model ?? this.config.model
    };
  }

  async stream(
    params: GenerateParams
  ): Promise<Observable<MessageEvent | AIResult>> {
    const start = Date.now();
    const { prompt, maxTokens, temperature } = params;

    return new Observable((subscriber) => {
      (async () => {
        try {
          let inputTokens = 0;
          let outputTokens = 0;
          let totalTokens = 0;
          let modelVersion: string | undefined;
          const text: string[] = [];
          const stream = await this.client.chat({
            model: this.config.model,
            messages: [{ role: "user", content: prompt }],
            options: {
              temperature,
              num_predict: maxTokens
            },
            stream: true
          });

          for await (const chunk of stream) {
            const chunkText = chunk.message?.content;
            if (chunkText) {
              subscriber.next({ data: chunkText });
              text.push(chunkText);
            }
            if (chunk.done) {
              inputTokens = chunk.prompt_eval_count ?? inputTokens;
              outputTokens = chunk.eval_count ?? outputTokens;
              totalTokens = inputTokens + outputTokens;
              modelVersion = chunk.model ?? modelVersion;
            }
          }
          subscriber.next({
            usage: {
              inputTokens,
              outputTokens,
              totalTokens
            },
            cost: null,
            latency: Date.now() - start,
            model: modelVersion ?? this.config.model,
            output: text.join("")
          } as AIResult);

          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }

  async withStructuredOutput<S extends ZodObject<any>>(
    query: string,
    schema: S
  ): Promise<output<S>> {
    const schemaJSON = schema._zod.toJSONSchema?.();

    const systemPrompt = `
You are a strict JSON generator.
Return ONLY valid JSON that matches this schema:

${JSON.stringify(schemaJSON, null, 2)}

Do not include explanations or markdown.
    `.trim();

    const res = await this.client.chat({
      model: this.config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      options: {
        temperature: 0
      }
    });

    const text = res.message?.content ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error(`JSON parse error: ${err}\nOutput:\n${text}`);
    }

    return schema.parse(parsed);
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await this.client.list();
      return { ok: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
}
