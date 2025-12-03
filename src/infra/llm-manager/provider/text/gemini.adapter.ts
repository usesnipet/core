import { randomUUID } from "crypto";
import { output, ZodObject } from "zod";

import { GoogleGenAI } from "@google/genai";

import { ProviderHealth } from "../types";
import { GenerateParams, GenerateResult, StreamChunk, TextProvider } from "./base";

type GeminiAdapterOptions = {
  apiKey: string;
  model: string;
}
export class GeminiTextAdapter extends TextProvider {
  private client: GoogleGenAI;
  constructor(private opts: GeminiAdapterOptions) {
    super();
    
    this.client = new GoogleGenAI({ apiKey: opts.apiKey });
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const { prompt, maxTokens, temperature } = params;
    const start = Date.now();
    const res = await this.client.models.generateContent({
      contents: [ {
        role: "user",
        parts: [ { text: prompt } ]
      } ],
      model: this.opts.model,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        tools: [ { googleSearch: {} } ]
      }
    });

    return {
      id: randomUUID(),
      output: res.text ?? "",
      tokensIn: res.usageMetadata?.promptTokenCount ?? 0,
      tokensOut: res.usageMetadata?.candidatesTokenCount ?? 0,
      generationTimeMs: Date.now() - start
    };
  }

  async stream(params: GenerateParams, onChunk: (chunk: StreamChunk) => void): Promise<void> {
    const { prompt, maxTokens, temperature } = params;
    const start = Date.now();
    const res = await this.client.models.generateContentStream({
      contents: [ {
        role: "user",
        parts: [ { text: prompt } ]
      } ],
      model: this.opts.model,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        tools: [ { googleSearch: {} } ]
      }
    });
    for await (const chunk of res) {
      const chunkText = chunk.text;
      onChunk({ delta: chunkText ?? "" });
    }
    onChunk({ delta: "", finishReason: "stop" });
  }

  async *iterableStream(params: GenerateParams): AsyncIterable<string> {
    const { prompt, maxTokens, temperature } = params;

    const res = await this.client.models.generateContentStream({
      contents: [ {
        role: "user",
        parts: [ { text: prompt } ]
      } ],
      model: this.opts.model,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        tools: [ { googleSearch: {} } ]
      }
    });
    return (async function*() {
      for await (const chunk of res) {
        const chunkText = chunk.text;
        if (chunkText) yield chunkText;
      }
    })()
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
      model: this.opts.model,
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
      await this.client.models.get({ model: this.opts.model });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }
}
