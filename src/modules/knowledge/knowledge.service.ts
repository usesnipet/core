import { KnowledgeEntity } from "@/entities";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SourceVectorStorePayload } from "@/infra/vector/payload/source-vector-store-payload";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { FilterOptions } from "@/shared/filter-options";
import { Service } from "@/shared/service";
import { buildOptions } from "@/utils/build-options";
import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { EntityManager, FindOneOptions } from "typeorm";

export type FindOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
}

export type Finder = (...args: any[]) => Partial<FindOptions>;

@Injectable()
export class KnowledgeService extends Service<KnowledgeEntity> {
  logger = new Logger(KnowledgeService.name);
  entity = KnowledgeEntity;

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly vectorStore:      SourceVectorStoreService;

  private getApiKey() {
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException();
    return apiKey;
  }

  override find(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity[]> {

    filterOptions ??= {};
    filterOptions.where ??= {};
    if (!this.getApiKey().root) filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).find(filterOptions);
  }

  override findByID(
    id: string,
    opts?: (Omit<FindOneOptions<KnowledgeEntity>, "where"> & { manager?: EntityManager; })
  ): Promise<KnowledgeEntity | null> {
    if (this.getApiKey().canAccessKnowledgeBase(id)) {
      return this.repository(opts?.manager).findOne({ where: { id }, ...opts });
    }
    throw new UnauthorizedException("You do not have permission to access this knowledge");
  }

  override findFirst(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    if (!this.getApiKey().root) filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).findOne(filterOptions);
  }

  override findUnique(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    if (!this.getApiKey().root) filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).findOne(filterOptions);
  }

  private buildFindOptions(knowledgeId: string, userInput: string, ...opts: Finder[]): FindOptions {
    return buildOptions({ knowledgeId, userInput }, opts);
  }

  async search(knowledgeId: string, query: string, ...options: Finder[]): Promise<SourceVectorStorePayload[]> {
    const opts = this.buildFindOptions(knowledgeId, query, ...options);
    // get knowledge
    const knowledge = await this.findByID(knowledgeId);
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
}