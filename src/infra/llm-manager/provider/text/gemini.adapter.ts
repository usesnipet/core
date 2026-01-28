import { Observable } from "rxjs";
import { output, ZodObject } from "zod";

import { GoogleGenAI, GoogleGenAIOptions } from "@google/genai";
import { MessageEvent } from "@nestjs/common";

import { ProviderHealth, ProviderInfo } from "../types";
import { GenerateParams, AIResult, TextProvider } from "./base";
import { BaseTextLLMConfig } from "@/types";

type GeminiAdapterOptions = BaseTextLLMConfig<GoogleGenAIOptions>;

export class GeminiTextAdapter extends TextProvider {
  private client: GoogleGenAI;

  constructor(private config: GeminiAdapterOptions) {
    super();
    this.client = new GoogleGenAI(config.opts);
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.config.model }
  }

  async generate(params: GenerateParams): Promise<AIResult> {
    const start = Date.now();
    const { prompt, maxTokens, temperature } = params;
    const res = await this.client.models.generateContent({
      contents: [ {
        role: "user",
        parts: [ { text: prompt } ]
      } ],
      model: this.config.model,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        tools: [ { googleSearch: {} } ]
      }
    });
    const inputTokens = res.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = res.usageMetadata?.candidatesTokenCount ?? 0;
    const totalTokens = res.usageMetadata?.totalTokenCount ?? inputTokens + outputTokens;
    return {
      output: res.text ?? "",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens
      },
      cost: null,
      latency: Date.now() - start,
      model: res.modelVersion ?? this.config.model,
    };
  }

  async stream(params: GenerateParams): Promise<Observable<MessageEvent | AIResult>> {
    const start = Date.now();
    const { prompt, maxTokens, temperature } = params;

    const res = await this.client.models.generateContentStream({
      contents: [ {
        role: "user",
        parts: [ { text: prompt } ]
      } ],
      model: this.config.model,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });
    return new Observable((subscriber) => {
      (async () => {
        try {
          let inputTokens = 0;
          let outputTokens = 0;
          let totalTokens = 0;
          let modelVersion: string | undefined;
          const text: string[] = [];
          for await (const chunk of res) {
            const chunkText = chunk.candidates?.[0].content?.parts?.[0]?.text;
            if (chunkText) {
              subscriber.next({ data: chunkText });
              text.push(chunkText);
            }
            inputTokens = chunk.usageMetadata?.promptTokenCount ?? inputTokens;
            outputTokens = chunk.usageMetadata?.candidatesTokenCount ?? outputTokens;
            totalTokens = chunk.usageMetadata?.totalTokenCount ?? totalTokens;
            modelVersion = chunk.modelVersion ?? modelVersion;
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
        } catch (error) {
          subscriber.error(error);
        }
      })()
    })
  }

  async withStructuredOutput<S extends ZodObject<any>>(
    query: string,
    schema: S
  ): Promise<output<S>> {
    const jsonSchema = schema._zod.toJSONSchema?.();

    const prompt = `
      You are a helpful assistant.
      Your task is to answer a question based on the following JSON schema:

      ${JSON.stringify(jsonSchema, null, 2)}
      Note: The output must be a valid JSON object that matches the schema above.

      Here is the query:
      "${query}"
    `.trim();

    const res = await this.client.models.generateContent({
      contents: [ {
        role: "user",
        parts: [ { text: prompt } ]
      } ],
      model: this.config.model,
      config: { temperature: 0 }
    });

    const text = res.data ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error(`Failed to parse JSON: ${err}\nText: ${text}`);
    }

    return schema.parse(parsed);
  }


  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await this.client.models.get({ model: this.config.model });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }
}
