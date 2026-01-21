import { VoyageAIClient } from "voyageai";

import { EmbedError } from "../../errors/embed.error";
import { ProviderHealth, ProviderInfo } from "../types";
import { EmbeddingProvider, MultipleEmbeddingResult, SingleEmbeddingResult } from "./base";

type VoyageOptions = {
  apiKey: string;
  model: string;
};

export class VoyageAIEmbeddingAdapter extends EmbeddingProvider {
  client: VoyageAIClient;

  constructor(private opts: VoyageOptions) {
    super();
    this.client = new VoyageAIClient({ apiKey: opts.apiKey });
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.opts.model }
  }

  embed(text: string): Promise<SingleEmbeddingResult>;
  embed(texts: string[]): Promise<MultipleEmbeddingResult>;
  async embed(texts: string | string[]): Promise<SingleEmbeddingResult | MultipleEmbeddingResult> {
    const start = Date.now();
    try {
      const response = await this.client.embed({
        model: this.opts.model,
        input: texts
      });

      if (!response.data) {
        throw new EmbedError("No embeddings found");
      }

      const embeddings = response.data.map((d) => d.embedding);
      if (embeddings.some((e) => !e)) throw new EmbedError("Some embeddings not found");

      if (Array.isArray(texts)) {
        return {
          cost: null,
          data: embeddings.map((e, i) => ({
            embeddings: e!,
            content: texts[i]
          })),
          latency: Date.now() - start,
          model: response.model ?? this.opts.model,
        }
      }
      return {
        cost: null,
        data: {
          embeddings: embeddings[0]!,
          content: texts
        },
        latency: Date.now() - start,
        model: response.model ?? this.opts.model,
      }
    } catch (error) {
      throw new EmbedError(error.message, { cause: error });
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();

    try {
      // Voyage não tem equivalente direto a "models.list()",
      // então fazemos uma chamada de embed mínima como health-check.
      await this.client.embed({
        model: this.opts.model,
        input: "ping"
      });

      return { ok: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
}
