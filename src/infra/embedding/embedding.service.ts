import { Inject, Injectable } from "@nestjs/common";
import { LLMManagerService } from "../llm-manager/llm-manager.service";
import { fingerprint } from "@/lib/fingerprint";
import { CacheService } from "../cache/cache.service";
import { SingleEmbeddingResult } from "../llm-manager/provider/embedding/base";


export type EmbeddingCache = {
  hash: string;
  embeddingResult: SingleEmbeddingResult;
}

@Injectable()
export class EmbeddingService {

  @Inject() private readonly llmManager: LLMManagerService;
  @Inject() private readonly cacheService: CacheService;

  get(fingerprint: string): Promise<EmbeddingCache | null> {
    return this.cacheService.get<EmbeddingCache>(fingerprint);
  }

  set(fingerprint: string, cache: EmbeddingCache): Promise<void> {
    return this.cacheService.set<EmbeddingCache>(fingerprint, cache);
  }

  async getOrCreateEmbedding(content: string): Promise<SingleEmbeddingResult> {
    if (!content) throw new Error('Content cannot be empty');

    let embeddingCache = await this.get(content);

    if (!embeddingCache) {
      const embeddingProvider = await this.llmManager.getEmbeddingProvider();
      if (!embeddingProvider) {
        throw new Error('No embedding provider available');
      }
      const hash = fingerprint(content);
      const embeddingResult = await embeddingProvider.embed(content);
      const cacheEntry = {
        hash,
        embeddingResult
      };
      await this.set(hash, cacheEntry);
      embeddingCache = cacheEntry;
    }

    return embeddingCache.embeddingResult;
  }
}