import OpenAI, { ClientOptions } from "openai";

import { ProviderHealth, ProviderInfo } from "../types";
import { EmbeddingProvider, MultipleEmbeddingResult, SingleEmbeddingResult } from "./base";
import { BaseEmbeddingLLMConfig } from "@/types";

type OpenAIOptions = BaseEmbeddingLLMConfig<ClientOptions>;

export class OpenAIEmbeddingAdapter extends EmbeddingProvider {
  client: OpenAI;

  constructor(private config: OpenAIOptions) {
    super();
    this.client = new OpenAI(config.opts);
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.config.model }
  }

  embed(text: string): Promise<SingleEmbeddingResult>;
  embed(texts: string[]): Promise<MultipleEmbeddingResult>;
  async embed(texts: string | string[]): Promise<SingleEmbeddingResult | MultipleEmbeddingResult> {
    const start = Date.now();

    const response = await this.client.embeddings.create({
      model: this.config.model,
      input: texts
    });
    if (Array.isArray(texts)) {
      return {
        cost: null,
        data: response.data.map((d) => ({
          embeddings: d.embedding,
          content: texts[d.index]
        })),
        latency: Date.now() - Date.now(),
        model: response.model
      }
    }
    return {
      cost: null,
      data: {
        embeddings: response.data[0].embedding,
        content: texts
      },
      latency: Date.now() - start,
      model: response.model
    }
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
