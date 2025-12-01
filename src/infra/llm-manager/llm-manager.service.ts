import { env } from "@/env";
import { __root } from "@/root";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { NotFoundError } from "./errors/not-found.error";
import { LLMLoaderService } from "./llm-loader.service";
import { EmbeddingProvider } from "./provider/embedding/base";
import { TextProvider } from "./provider/text/base";
import { getPresets } from "@/lib/presets";
import { LLMPreset } from "@/types/llm-preset";

@Injectable()
export class LLMManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LLMManagerService.name);

  instances: Map<string, { instance: EmbeddingProvider | TextProvider, lastUse: number }> = new Map();

  constructor(private readonly loader: LLMLoaderService) { }

  async getEmbeddingProvider(): Promise<EmbeddingProvider | null> {
    const presets = await getPresets();
    const embeddingPreset = presets.find(p => p.key === env.LLM_EMBEDDING_DEFAULT_PRESET_KEY);
    if (!embeddingPreset) throw new Error("Embedding preset not found");
    await this.getInstance(embeddingPreset, env.LLM_EMBEDDING_DEFAULT_CONFIG);
    return this.getInstance<EmbeddingProvider>(embeddingPreset, env.LLM_EMBEDDING_DEFAULT_CONFIG);
  }

  async getTextProvider(): Promise<TextProvider | null> {
    const presets = await getPresets();
    const textPreset = presets.find(p => p.key === env.LLM_TEXT_DEFAULT_PRESET_KEY);
    if (!textPreset) throw new Error("Text preset not found");
    await this.getInstance(textPreset, env.LLM_TEXT_DEFAULT_CONFIG);
    return this.getInstance<TextProvider>(textPreset, env.LLM_TEXT_DEFAULT_CONFIG);
  }

  async getInstance<T>(
    preset: LLMPreset,
    config: any
  ): Promise<T | null> {
    if (this.instances.has(preset.key)) return this.instances.get(preset.key)!.instance as any;

    if (!preset) throw new NotFoundError("LLM not found");
    const instance = await this.loader.load(preset, config);

    this.addInstance(preset, instance);
    return instance as any;
  }

  private addInstance(preset: LLMPreset, instance: EmbeddingProvider | TextProvider): void {
    this.instances.set(preset.key, { instance, lastUse: Date.now() });
  }

  async onModuleInit() {
    const presets = await getPresets();
    const embeddingPreset = presets.find(p => p.key === env.LLM_EMBEDDING_DEFAULT_PRESET_KEY);
    const textPreset = presets.find(p => p.key === env.LLM_TEXT_DEFAULT_PRESET_KEY);
    if (!embeddingPreset) throw new Error("Embedding preset not found");
    if (!textPreset) throw new Error("Text preset not found");
    await this.getInstance(embeddingPreset, env.LLM_EMBEDDING_DEFAULT_CONFIG);
    await this.getInstance(textPreset, env.LLM_TEXT_DEFAULT_CONFIG);
  }

  async onModuleDestroy(): Promise<void> {
    this.instances.forEach((_, key) => {
      this.logger.verbose(`Disposing instance ${key}...`);
      this.instances.get(key)?.instance.dispose();
      this.instances.delete(key);
    });
  }
}
