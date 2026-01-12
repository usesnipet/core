import OpenAI from "openai";
import { output, ZodObject } from "zod";

import { ProviderHealth, ProviderInfo } from "../types";
import { GenerateParams, GenerateResult, StreamChunk, TextProvider } from "./base";
import { Observable } from "rxjs";
import { MessageEvent } from "@nestjs/common";

type OpenAIOptions = {
  baseURL: string;
  apiKey: string;
  model: string;
}

export class OpenAITextAdapter extends TextProvider {
  client: OpenAI;

  constructor(private opts: OpenAIOptions) {
    super();
    this.client = new OpenAI({ baseURL: opts.baseURL, apiKey: opts.apiKey });
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.opts.model }
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const { prompt, maxTokens, temperature } = params;
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.opts.model,
      messages: [ { role: "user", content: prompt } ],
      max_tokens: maxTokens,
      temperature,
      stream: false
    });

    const message = response.choices[0]?.message?.content ?? "";
    const tokensIn = response.usage?.prompt_tokens ?? 0;
    const tokensOut = response.usage?.completion_tokens ?? 0;

    return {
      id: response.id,
      output: message,
      tokensIn,
      tokensOut,
      generationTimeMs: Date.now() - start
    };
  }

  async stream(params: GenerateParams, onChunk: (chunk: StreamChunk) => void): Promise<void> {
    const { prompt, maxTokens, temperature } = params;
    const stream = await this.client.chat.completions.create({
      model: this.opts.model,
      messages: [ { role: "user", content: prompt } ],
      max_tokens: maxTokens,
      temperature,
      stream: true
    });

    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content;
      if (delta) {
        onChunk({ delta });
      }
      if (part.choices[0]?.finish_reason) {
        onChunk({ delta: "", finishReason: part.choices[0].finish_reason });
      }
    }
  }

  async observableStream(params: GenerateParams): Promise<Observable<MessageEvent>> {
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
          for await (const chunk of stream) {
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
