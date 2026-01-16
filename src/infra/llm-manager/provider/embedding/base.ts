import { ProviderInfo } from "../types";

export abstract class EmbeddingProvider {
  abstract info(): Promise<ProviderInfo>;
  abstract embed(text: string): Promise<number[]>;
  abstract embed(texts: string[]): Promise<number[][]>;

  dispose(): Promise<void> {
    return Promise.resolve();
  }
}
