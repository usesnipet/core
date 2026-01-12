import z from "zod";

import { ProviderHealth, ProviderInfo } from "../types";
import { Observable } from "rxjs";
import { MessageEvent } from "@nestjs/common";

export interface GenerateParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

export interface GenerateResult {
  id: string;
  output: string;
  tokensIn: number;
  tokensOut: number;
  generationTimeMs: number;
}

export interface StreamChunk {
  delta: string;
  finishReason?: string;
}

export abstract class TextProvider {
  abstract info(): Promise<ProviderInfo>;
  abstract countTokens(text: string): number;
  abstract generate(params: GenerateParams): Promise<GenerateResult>;
  abstract stream(params: GenerateParams): Observable<MessageEvent> | Promise<Observable<MessageEvent>>;
  abstract healthCheck?(): Promise<ProviderHealth>;
  abstract withStructuredOutput<S extends z.ZodObject<any>>(query: string, schema: S): Promise<z.infer<S>>;

  dispose(): Promise<void> {
    return Promise.resolve();
  }
}
