import { ProviderInfo } from "../types";
export type EmbeddingData = {
  content: string;
  embeddings: number[]
}
type BaseEmbeddingResult = {
  model: string;
  cost: number | null;
  latency: number;
}
export type MultipleEmbeddingResult = BaseEmbeddingResult & {
  data: EmbeddingData[];
}
export type SingleEmbeddingResult = BaseEmbeddingResult & {
  data: EmbeddingData
}

export abstract class EmbeddingProvider {
  abstract info(): Promise<ProviderInfo>;
  abstract embed(text: string): Promise<SingleEmbeddingResult>;
  abstract embed(texts: string[]): Promise<MultipleEmbeddingResult>;

  dispose(): Promise<void> {
    return Promise.resolve();
  }
}
