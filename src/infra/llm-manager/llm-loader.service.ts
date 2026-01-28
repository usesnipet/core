
import { Injectable } from "@nestjs/common";

import { EmbeddingProvider, MultipleEmbeddingResult, SingleEmbeddingResult } from "./provider/embedding/base";
import { GeminiLLMEmbeddingAdapter } from "./provider/embedding/gemini.adapter";
import { OpenAIEmbeddingAdapter } from "./provider/embedding/openai.adapter";
import { TextProvider } from "./provider/text/base";
import { GeminiTextAdapter } from "./provider/text/gemini.adapter";
import { OpenAITextAdapter } from "./provider/text/openai.adapter";
import { VoyageAIEmbeddingAdapter } from "./provider/embedding/voyage.adapter";
import { OllamaTextAdapter } from "./provider/text/ollama.adapter";
import { OllamaEmbeddingAdapter } from "./provider/embedding/ollama.adapter";

@Injectable()
export class LLMLoaderService {
  async load(type: "TEXT", provider: string, config: any): Promise<TextProvider>
  async load(type: "EMBEDDING", provider: string, config: any): Promise<EmbeddingProvider>
  async load(
    type: "TEXT" | "EMBEDDING",
    provider: string,
    config: any
  ): Promise<TextProvider | EmbeddingProvider> {
    const adapter = provider;

    if (type === "TEXT") return this.textProviderLoader(adapter, config);
    return this.embeddingProviderLoader(adapter, config);
  }

  private textProviderLoader(
    adapter: string,
    config: any
  ): TextProvider {
    let AdapterClass: new (config: any) => TextProvider;

    switch (adapter) {
      case "openai":
        AdapterClass = OpenAITextAdapter;
        break;
      case "gemini":
        AdapterClass = GeminiTextAdapter;
        break;
      case "ollama":
        AdapterClass = OllamaTextAdapter;
        break;
      default:
        AdapterClass = OpenAITextAdapter;
        break;
    }

    return new AdapterClass(config);
  }

  private embeddingProviderLoader(
    adapter: string,
    config: any
  ): EmbeddingProvider {
    let AdapterClass: new (config: any) => EmbeddingProvider;
    switch (adapter) {
      case "openai":
        AdapterClass = OpenAIEmbeddingAdapter;
        break;
      case "gemini":
        AdapterClass = GeminiLLMEmbeddingAdapter;
        break;
      case "voyage":
        AdapterClass = VoyageAIEmbeddingAdapter;
        break;
      case "ollama":
        AdapterClass = OllamaEmbeddingAdapter;
        break;
      default:
        AdapterClass = OpenAIEmbeddingAdapter;
        break;
    }

    return new AdapterClass(config);
  }
}
