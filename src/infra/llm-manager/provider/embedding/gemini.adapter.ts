import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

import { EmbeddingProvider } from "./base";

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

  embed(text: string): Promise<number[]>;
  embed(texts: string[]): Promise<number[][]>;
  override async embed(texts: string | string[]): Promise<number[] | number[][]> {
    const inputs = Array.isArray(texts) ? texts : [ texts ];

    const embeddings = await Promise.all(
      inputs.map(async (text) => {
        console.log("loading embedding for: " + text);

        const result = await this.model.embedContent(text);
        return result.embedding?.values ?? [];
      })
    );

    return Array.isArray(texts) ? embeddings : embeddings[0];
  }
}
