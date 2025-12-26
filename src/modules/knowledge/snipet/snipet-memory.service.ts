import { SnipetMemoryEntity } from "@/entities/snipet-memory.entity";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SnipetVectorStorePayload } from "@/infra/vector/payload/snipet-vector-store-payload";
import { SnipetVectorStoreService } from "@/infra/vector/snipet-vector-store.service";
import { Service } from "@/shared/service";
import { buildOptions } from "@/utils/build-options";
import { Inject, Logger } from "@nestjs/common";
import { EntityManager } from "typeorm";

export type SnipetSearchOptions = {
  lastNMessages?: number;
  searchQuery?: string | { topK?: number, query: string };
  filters?: Record<string, string | number | boolean>;
}

export type WithSnipetSearchOptions = (currentOpts: Partial<SnipetSearchOptions>) => Partial<SnipetSearchOptions>;

export class SnipetMemoryService extends Service<SnipetMemoryEntity> {
  entity = SnipetMemoryEntity;
  logger: Logger;

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly snipetVectorStore: SnipetVectorStoreService;

  private memoryToPayload(
    knowledgeId: string,
    memory: SnipetMemoryEntity,
    embedding: number[],
    content: string
  ): SnipetVectorStorePayload {
    return new SnipetVectorStorePayload({
      dense: embedding,
      id: memory.id,
      snipetId: memory.snipetId,
      content: content,
      fullContent: content,
      metadata: {
        type: memory.type,
        payload: memory.payload,
      },
      knowledgeId,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    })
  }

  override create(input: SnipetMemoryEntity, manager?: EntityManager): Promise<SnipetMemoryEntity>;
  override create(input: SnipetMemoryEntity[], manager?: EntityManager): Promise<SnipetMemoryEntity[]>;
  override create(
    input: SnipetMemoryEntity | SnipetMemoryEntity[],
    manager?: EntityManager
  ): Promise<SnipetMemoryEntity | SnipetMemoryEntity[]> {
    return this.transaction(async (manager) => {
      const createdMemories: SnipetMemoryEntity[] = [];
      if (Array.isArray(input)) createdMemories.push(...await super.create(input, manager));
      else createdMemories.push(await super.create(input, manager));

      await Promise.all(createdMemories.map(m => this.embed(m.knowledgeId, m, m.payload.text)));
      if (Array.isArray(input)) return createdMemories;
      return createdMemories[0];
    }, manager);
  }

  private async embed(
    knowledgeId: string,
    memory: SnipetMemoryEntity,
    content: string
  ): Promise<SnipetVectorStorePayload> {
    const embedding = await this.embeddingService.getOrCreateEmbedding(content);
    return await this.snipetVectorStore.add(
      this.memoryToPayload(knowledgeId, memory, embedding.embeddings, content)
    );
  }

  async remove(memory: SnipetMemoryEntity) {
    await this.snipetVectorStore.remove(memory.id);
  }

  async search(knowledgeId: string, snipetId: string, ...opts: WithSnipetSearchOptions[]) {
    const options = this.buildSnipetSearchOptions(...opts);
    const response: { lastNMemories: SnipetMemoryEntity[], searchQuery: SnipetVectorStorePayload[] } = {
      lastNMemories: [],
      searchQuery: []
    }
    if (options.lastNMessages) {
      response.lastNMemories = await this.find({
        where: { snipetId },
        order: { createdAt: "DESC" },
        take: options.lastNMessages,
        relations: ["snipet"]
      })
    }

    if (options.searchQuery) {
      const query = options.searchQuery;
      const queryEmbedding = await this.embeddingService.getOrCreateEmbedding(typeof query === "string" ? query : query.query);
      const opts = [
        SnipetVectorStoreService.withSnipetId(snipetId),
        SnipetVectorStoreService.withDense({ vector: queryEmbedding.embeddings, topK: typeof query === "string" ? undefined : query.topK }),
      ]
      if (options.filters) opts.push(SnipetVectorStoreService.withFilters(options.filters))
      const searchQuery = await this.snipetVectorStore.search(
        knowledgeId,
        ...opts
      )
      response.searchQuery = searchQuery;
    }
    return response;
  }

  static withFilters(filters: Record<string, string | number | boolean>): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      return { ...currentOpts, filters: { ...currentOpts.filters, ...filters } };
    }
  }

  static withLastNMessages(lastNMessages: number): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      return { ...currentOpts, lastNMessages };
    }
  }

  static withSearchQuery(searchQuery: string): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      return { ...currentOpts, searchQuery };
    }
  }

  protected buildSnipetSearchOptions(...opts: WithSnipetSearchOptions[]) {
    return buildOptions<WithSnipetSearchOptions, SnipetSearchOptions>({}, opts);
  }
}