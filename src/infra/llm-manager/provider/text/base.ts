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

export interface AIResult {
  output: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number | null;
  latency: number;
}

export abstract class TextProvider {
  abstract info(): Promise<ProviderInfo>;
  abstract countTokens(text: string): number;
  abstract generate(params: GenerateParams): Promise<AIResult>;
  abstract stream(
    params: GenerateParams
  ): Observable<MessageEvent | AIResult> | Promise<Observable<MessageEvent | AIResult>>;
  abstract healthCheck?(): Promise<ProviderHealth>;
  abstract withStructuredOutput<S extends z.ZodObject<any>>(query: string, schema: S): Promise<z.infer<S>>;

  dispose(): Promise<void> {
    return Promise.resolve();
  }
}
