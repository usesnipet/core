import { BaseEmbeddingLLMConfig } from "@/types";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

import { ProviderInfo } from "../types";

import { EmbeddingProvider, MultipleEmbeddingResult, SingleEmbeddingResult } from "./base";

type GeminiOptions = BaseEmbeddingLLMConfig<{
  apiKey: string;
}>;

export class GeminiLLMEmbeddingAdapter extends EmbeddingProvider {
  client: GoogleGenerativeAI;
  model: GenerativeModel;

  constructor({ opts, model }: GeminiOptions) {
    super();
    this.client = new GoogleGenerativeAI(opts.apiKey);
    this.model = this.client.getGenerativeModel({ model });
  }

  async info(): Promise<ProviderInfo> {
    return { name: this.model.model }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  embed(text: string): Promise<SingleEmbeddingResult>;
  embed(texts: string[]): Promise<MultipleEmbeddingResult>;
  async embed(
    texts: string | string[],
    batchSize = 10
  ): Promise<SingleEmbeddingResult | MultipleEmbeddingResult> {

    const start = Date.now();
    const inputs = Array.isArray(texts) ? texts : [texts];

    const allEmbeddings: number[][] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (text) => {
          const result = await this.model.embedContent(text);
          return result.embedding?.values ?? [];
        })
      );

      allEmbeddings.push(...batchResults);

      if (i + batchSize < inputs.length) {
        console.log("waiting....");

        await this.sleep(60_000);
        console.log("going to next....");
      }
    }

    const latency = Date.now() - start;

    if (Array.isArray(texts)) {
      return {
        cost: null,
        data: allEmbeddings.map((embedding, index) => ({
          embeddings: embedding,
          content: texts[index],
        })),
        latency,
        model: this.model.model,
      };
    }

    return {
      cost: null,
      data: {
        embeddings: allEmbeddings[0],
        content: texts,
      },
      latency,
      model: this.model.model,
    };
  }

}
