import moment from "moment";

import { Fragments, SourceFragment } from "@/fragment";
import { CacheService } from "@/infra/cache/cache.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { KnowledgeService } from "@/modules/knowledge/knowledge.service";
import { buildOptions } from "@/utils/build-options";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";

import { Recent } from "../type/recent";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SourceVectorStorePayload } from "@/infra/vector/payload/source-vector-store-payload";

export type FindOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
  forceUsePlugins?: string[]; // list of plugin ids
  excludePlugins?: string[]; // list of plugin ids
}

export type Finder = (...args: any[]) => Partial<FindOptions>;

@Injectable()
export class SourceMemoryService {
  private readonly logger = new Logger(SourceMemoryService.name);

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly vectorStore:      SourceVectorStoreService;
  @Inject() private readonly knowledgeService: KnowledgeService;
  @Inject() private readonly cacheService:     CacheService;

  private buildFindOptions(knowledgeId: string, userInput: string, ...opts: Finder[]): FindOptions {
    return buildOptions({ knowledgeId, userInput }, opts);
  }

  async search(knowledgeId: string, query: string, ...options: Finder[]): Promise<SourceVectorStorePayload[]> {
    const opts = this.buildFindOptions(knowledgeId, query, ...options);
    // get knowledge
    const knowledge = await this.knowledgeService.findByID(knowledgeId);
    if (!knowledge) throw new NotFoundException("Knowledge not found");

    const queryEmbedding = await this.embeddingService.getOrCreateEmbedding(query);
    return this.vectorStore.search(
      knowledgeId,
      SourceVectorStoreService.withFilters({ ...opts.metadata }),
      SourceVectorStoreService.withDense({ vector: queryEmbedding.embeddings, topK: 100 }),
      SourceVectorStoreService.withSparse({ query: query, topK: 100 }),
      SourceVectorStoreService.withTopK(10),
    );
  }

  private async findPayloadInCache(knowledgeId: string, userInput: string): Promise<SourceVectorStorePayload[] | null> {
    const key = encodeURIComponent(userInput.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase());
    return this.cacheService.get<SourceVectorStorePayload[]>(`source-payload:${key}`, { namespace: knowledgeId });
  }

  private async savePayloadInCache(knowledgeId: string, userInput: string, payload: SourceVectorStorePayload[]) {
    const key = encodeURIComponent(userInput.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase());
    await this.cacheService.set<SourceVectorStorePayload[]>(
      `source-payload:${key}`,
      payload,
      { namespace: knowledgeId, ttl: 60 * 5 } // expires cache in 5 minutes
    );
  }

  private async saveInputToRecents(knowledgeId: string, text: string) {
    const recents = (await this.cacheService.get<Recent[]>("recent", { namespace: knowledgeId })) ?? [];
    const index = recents.findIndex(p => p.text === text);
    if (index !== -1) {
      recents[index].count += 1;
      recents[index].lastUsed = new Date();
    } else {
      recents.push({ text, count: 1, lastUsed: new Date() });
    }
    recents.sort((a, b) => moment(b.lastUsed).valueOf() - moment(a.lastUsed).valueOf());
    while(recents.length > 5) recents.pop();

    await this.cacheService.set<Recent[]>("recent", recents, { namespace: knowledgeId });
  }

  async findByTerm(knowledgeId: string, term: string): Promise<SourceVectorStorePayload[]> {
    await this.saveInputToRecents(knowledgeId, term);

    const cachedPayload = await this.findPayloadInCache(knowledgeId, term);
    if (cachedPayload) return cachedPayload;

    const payload = await this.vectorStore.search(
      knowledgeId,
      SourceVectorStoreService.withSparse(term),
      SourceVectorStoreService.withTerm(term),
    );
    await this.savePayloadInCache(knowledgeId, term, payload);
    return payload;
  }

  async findRecent(knowledgeId: string) {
    return this.cacheService.get<string[]>("recent", { namespace: knowledgeId });
  }

  static withMetadata(metadata: Record<string, any>): Finder {
    return prev => ({ ...prev, metadata });
  }
  static withExcludePlugins(plugins: string[]): Finder {
    return prev => ({ ...prev, excludePlugins: plugins });
  }
  static withForceUsePlugins(plugins: string[]): Finder {
    return prev => ({ ...prev, forceUsePlugins: plugins });
  }
}
