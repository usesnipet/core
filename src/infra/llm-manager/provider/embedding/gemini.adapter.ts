import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

import { EmbeddingProvider, MultipleEmbeddingResult, SingleEmbeddingResult } from "./base";
import { ProviderInfo } from "../types";
import e from "express";

type GeminiOptions = {
  apiKey: string;
  model: string;
};

export class GeminiLLMEmbeddingAdapter extends EmbeddingProvider {
  client: GoogleGenerativeAI;
  model: GenerativeModel;

  constructor(opts: GeminiOptions) {
    super();
    this.client = new GoogleGenerativeAI(opts.apiKey);
    this.model = this.client.getGenerativeModel({ model: opts.model });
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.model.model }
  }


  embed(text: string): Promise<SingleEmbeddingResult>;
  embed(texts: string[]): Promise<MultipleEmbeddingResult>;
  async embed(texts: string | string[]): Promise<SingleEmbeddingResult | MultipleEmbeddingResult> {
    const start = Date.now();
    const inputs = Array.isArray(texts) ? texts : [ texts ];

    const embeddings = await Promise.all(
      inputs.map(async (text) => {
        const result = await this.model.embedContent(text);
        return result.embedding?.values ?? [];
      })
    );
    if (Array.isArray(texts)) {
      return {
        cost: null,
        data: embeddings.map((d, i) => ({
          embeddings: d,
          content: texts[i]
        })),
        latency: Date.now() - Date.now(),
        model: this.model.model
      }
    }
    return {
      cost: null,
      data: {
        embeddings: embeddings[0],
        content: texts
      },
      latency: Date.now() - start,
      model: this.model.model
    }
  }
}
