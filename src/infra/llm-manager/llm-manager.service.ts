import { env } from "@/env";
import { __root } from "@/root";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { LLMLoaderService } from "./llm-loader.service";
import { EmbeddingProvider } from "./provider/embedding/base";
import { TextProvider } from "./provider/text/base";
import { fingerprint } from "@/lib/fingerprint";
import { BaseEmbeddingLLMConfig, BaseTextLLMConfig } from "@/types";

@Injectable()
export class LLMManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LLMManagerService.name);

  instances: Map<string, { instance: EmbeddingProvider | TextProvider, lastUse: number }> = new Map();

  constructor(private readonly loader: LLMLoaderService) { }

  private generateKey(type: "TEXT" | "EMBEDDING", provider: string, config: any): string {
    return fingerprint(`${type}-${provider}-${JSON.stringify(config)}`);
  }

  async getEmbeddingProvider(): Promise<EmbeddingProvider | null> {
    return await this.getInstance(
      "EMBEDDING",
      env.LLM_EMBEDDING_DEFAULT_PROVIDER,
      {
        model: env.LLM_EMBEDDING_DEFAULT_MODEL,
        dimension: env.LLM_EMBEDDING_DEFAULT_DIMENSION,
        opts: env.LLM_EMBEDDING_DEFAULT_OPTIONS
      }
    );
  }

  async getTextProvider(): Promise<TextProvider | null> {
    return await this.getInstance(
      "TEXT",
      env.LLM_TEXT_DEFAULT_PROVIDER,
      {
        model: env.LLM_TEXT_DEFAULT_MODEL,
        opts: env.LLM_TEXT_DEFAULT_OPTIONS
      }
    );
  }

  async getInstance(type: "TEXT", provider: string, config: BaseTextLLMConfig): Promise<TextProvider | null>
  async getInstance(
    type: "EMBEDDING",
    provider: string,
    config: BaseEmbeddingLLMConfig
  ): Promise<EmbeddingProvider | null>
  async getInstance(
    type: "TEXT" | "EMBEDDING",
    provider: string,
    config: any
  ): Promise<EmbeddingProvider | TextProvider | null> {
    const key = this.generateKey(type, provider, config);
    if (this.instances.has(key)) return this.instances.get(key)!.instance;
    let instance: TextProvider | EmbeddingProvider | null = null;

    if (type === "TEXT") instance = await this.loader.load(type, provider, config);
    else instance = await this.loader.load(type, provider, config);

    this.addInstance(key, instance);
    return instance;
  }

  private addInstance(key: string, instance: EmbeddingProvider | TextProvider): void {
    this.instances.set(key, { instance, lastUse: Date.now() });
  }

  async onModuleInit() {
    await this.getInstance(
      "EMBEDDING",
      env.LLM_EMBEDDING_DEFAULT_PROVIDER,
      {
        model: env.LLM_EMBEDDING_DEFAULT_MODEL,
        dimension: env.LLM_EMBEDDING_DEFAULT_DIMENSION,
        opts: env.LLM_EMBEDDING_DEFAULT_OPTIONS
      }
    );
    await this.getInstance(
      "TEXT",
      env.LLM_TEXT_DEFAULT_PROVIDER,
      {
        model: env.LLM_TEXT_DEFAULT_MODEL,
        opts: env.LLM_TEXT_DEFAULT_OPTIONS
      }
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.instances.forEach((_, key) => {
      this.logger.verbose(`Disposing instance ${key}...`);
      this.instances.get(key)?.instance.dispose();
      this.instances.delete(key);
    });
  }
}
