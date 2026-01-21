import OpenAI from "openai";
import { output, ZodObject } from "zod";

import { ProviderHealth, ProviderInfo } from "../types";
import { GenerateParams, AIResult, TextProvider } from "./base";
import { Observable } from "rxjs";
import { MessageEvent } from "@nestjs/common";
import { getUniversalEncoding } from "../../utils";

type OpenAIOptions = {
  baseURL: string;
  apiKey: string;
  model: string;
}

export class OpenAITextAdapter extends TextProvider {
  client: OpenAI;

  countTokens(text: string): number {
    return getUniversalEncoding(this.opts.model).encode(text).length
  }

  constructor(private opts: OpenAIOptions) {
    super();
    this.client = new OpenAI({ baseURL: opts.baseURL, apiKey: opts.apiKey });
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.opts.model }
  }

  async generate(params: GenerateParams): Promise<AIResult> {
    const start = Date.now();
    const { prompt, maxTokens, temperature } = params;

    const response = await this.client.chat.completions.create({
      model: this.opts.model,
      messages: [ { role: "user", content: prompt } ],
      max_tokens: maxTokens,
      temperature,
      stream: false
    });

    const message = response.choices[0]?.message?.content ?? "";
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;
    const totalTokens = response.usage?.total_tokens ?? inputTokens + outputTokens;

    return {
      output: message,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens
      },
      cost: null,
      latency: Date.now() - start,
      model: response.model
    };
  }

  async stream(params: GenerateParams): Promise<Observable<MessageEvent | AIResult>> {
    const start = Date.now();
    const { prompt, maxTokens, temperature } = params;

    const stream = await this.client.chat.completions.create({
      model: this.opts.model,
      messages: [ { role: "user", content: prompt } ],
      max_tokens: maxTokens,
      temperature,
      stream: true
    });
    return new Observable((subscriber) => {
      (async () => {
        try {
          // TODO - send AIResult on finish stream
          for await (const chunk of stream) {
            console.log(chunk);

            const chunkText = chunk.choices[0]?.delta?.content;
            if (chunkText) subscriber.next({ data: chunkText });
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })()
    });
  }

  async withStructuredOutput<S extends ZodObject<any>>(
    query: string,
    schema: S
  ): Promise<output<S>> {
    const schemaJSON = schema._zod.toJSONSchema?.();

    const prompt = `
      You are a helpful assistant.
      Your task is to answer a question based on the following JSON schema:

      ${JSON.stringify(schemaJSON, null, 2)}
      Note: The output must be a valid JSON object that matches the schema above.
    `.trim();

    const res = await this.client.chat.completions.create({
      model: this.opts.model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }, // JSON MODE
      temperature: 0,
      stream: false
    });

    const text = res.choices[0].message?.content ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error(
        `Failure parsing output: ${err}\nOutput:\n${text}`
      );
    }

    return schema.parse(parsed);
  }


  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await this.client.models.list();
      return { ok: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
}
