import { SnipetMessageEntity } from "@/entities";
import { Fragments, SnipetFragment } from "@/fragment";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SnipetVectorStorePayload } from "@/infra/vector/payload/snipet-vector-store-payload";
import { SnipetVectorStoreService } from "@/infra/vector/snipet-vector-store.service";
import { buildOptions } from "@/utils/build-options";
import { Inject, Injectable } from "@nestjs/common";
import { DataSource, EntityManager, Repository } from "typeorm";

export type SnipetSearchOptions = {
  lastNMessages?: number;
  searchQuery?: string | { topK?: number, query: string };
  filters?: Record<string, string | number | boolean>;
}

export type WithSnipetSearchOptions = (currentOpts: Partial<SnipetSearchOptions>) =>  Partial<SnipetSearchOptions>;


@Injectable()
export class SnipetMemoryService {
  private readonly dataSource: DataSource;

  snipetMessageRepository(manager?: EntityManager): Repository<SnipetMessageEntity> {
    return manager ?
      manager.getRepository(SnipetMessageEntity) :
      this.dataSource.getRepository(SnipetMessageEntity);
  }

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly snipetVectorStore: SnipetVectorStoreService;

  private messageToPayload(
    knowledgeId: string,
    message: SnipetMessageEntity,
    embedding: number[]
  ): SnipetVectorStorePayload {
    return new SnipetVectorStorePayload({
      dense: embedding,
      id: message.id,
      snipetId: message.snipetId,
      content: message.content,
      fullContent: message.content,
      metadata: {
        role: message.role,        
      },
      knowledgeId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    })
  }

  async add(knowledgeId: string, message: SnipetMessageEntity) {
    const embedding = await this.embeddingService.getOrCreateEmbedding(message.content);
    await this.snipetVectorStore.add(this.messageToPayload(knowledgeId, message, embedding.embeddings));
  }

  async remove(knowledgeId: string, message: SnipetMessageEntity) {
    const embedding = await this.embeddingService.getOrCreateEmbedding(message.content);
    await this.snipetVectorStore.remove(this.messageToPayload(knowledgeId, message, embedding.embeddings));
  }

  async search(knowledgeId: string, snipetId: string, ...opts: WithSnipetSearchOptions[]) {
    const options = this.buildSnipetSearchOptions(...opts);
    const response: { lastNMessages: SnipetMessageEntity[], searchQuery: SnipetVectorStorePayload[] } = {
      lastNMessages: [],
      searchQuery: []
    }
    if (options.lastNMessages) {
      response.lastNMessages = await this.snipetMessageRepository().find({
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
