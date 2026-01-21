import { Config, Ollama } from "ollama";

import {
  EmbeddingProvider,
  MultipleEmbeddingResult,
  SingleEmbeddingResult
} from "./base";
import { ProviderInfo } from "../types";
import { BaseEmbeddingLLMConfig } from "@/types";

type OllamaEmbeddingOptions = BaseEmbeddingLLMConfig<Partial<Config>>;

export class OllamaEmbeddingAdapter extends EmbeddingProvider {
  private client: Ollama;

  constructor(private config: OllamaEmbeddingOptions) {
    super();
    this.client = new Ollama(config.opts);
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.config.model };
  }

  embed(text: string): Promise<SingleEmbeddingResult>;
  embed(texts: string[]): Promise<MultipleEmbeddingResult>;
  async embed(
    texts: string | string[]
  ): Promise<SingleEmbeddingResult | MultipleEmbeddingResult> {
    const start = Date.now();
    const inputs = Array.isArray(texts) ? texts : [texts];

    const embeddings = await Promise.all(
      inputs.map(async (text) => {
        const res = await this.client.embeddings({
          model: this.config.model,
          prompt: text
        });
        return res.embedding ?? [];
      })
    );

    if (Array.isArray(texts)) {
      return {
        cost: null,
        data: embeddings.map((embedding, i) => ({
          embeddings: embedding,
          content: texts[i]
        })),
        latency: Date.now() - start,
        model: this.config.model
      };
    }

    return {
      cost: null,
      data: {
        embeddings: embeddings[0],
        content: texts
      },
      latency: Date.now() - start,
      model: this.config.model
    };
  }
}
