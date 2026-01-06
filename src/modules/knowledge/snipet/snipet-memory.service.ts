import { MemoryType, SnipetMemoryEntity } from "@/entities/snipet-memory.entity";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SnipetVectorStorePayload } from "@/infra/vector/payload/snipet-vector-store-payload";
import { SnipetVectorStoreService } from "@/infra/vector/snipet-vector-store.service";
import { GenericService } from "@/shared/generic-service";
import { buildOptions } from "@/utils/build-options";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { ExecuteSnipetDto } from "./dto/execute-snipet.dto";
import { AnswerOutput } from "./output-parser/answer.parser";
import { SummarizeOutput } from "./output-parser/summarize.parser";
import { SnipetIntent } from "@/types/snipet-intent";
import { ExpandOutput } from "./output-parser/expand.parser";

export type SnipetSearchOptions = {
  lastNMemories?: number;
  query?: string | { topK?: number, query: string };
  filters?: Record<string, string | number | boolean>;
}

export type WithSnipetSearchOptions = (currentOpts: Partial<SnipetSearchOptions>) => Partial<SnipetSearchOptions>;

export class SnipetMemoryService extends GenericService {
  logger = new Logger(SnipetMemoryService.name);

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly snipetVectorStore: SnipetVectorStoreService;

  repository(manager?: EntityManager): Repository<SnipetMemoryEntity> {
    return manager ? manager.getRepository(SnipetMemoryEntity) : this.dataSource.getRepository(SnipetMemoryEntity);
  }

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
        payload: memory.payload,
      },
      knowledgeId,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    })
  }

  async save(ex: ExecuteSnipetDto, type: MemoryType.USER_INPUT, payload: string, manager?: EntityManager): Promise<SnipetMemoryEntity>
  async save(
    ex: ExecuteSnipetDto,
    type: MemoryType.TEXT_ASSISTANT_OUTPUT,
    payload: AnswerOutput | SummarizeOutput | ExpandOutput,
    manager?: EntityManager
  ): Promise<SnipetMemoryEntity>

  async save({ knowledgeId, snipetId, intent }: ExecuteSnipetDto, type: MemoryType, payload: any, manager?: EntityManager): Promise<SnipetMemoryEntity> {
    const MEMORY_POLICIES = {
      user_input: {
        embed: true,
        extractText: (payload: string) => payload
      },
      text_assistant_output: {
        embed: true,
        extractText: (payload: any) => {
          switch (intent) {
            case SnipetIntent.ANSWER:
              return (payload as AnswerOutput).answer;
            case SnipetIntent.SUMMARIZE:
              return (payload as SummarizeOutput).summary;
            case SnipetIntent.EXPAND:
              return (payload as ExpandOutput).expandedText;
            default:
              throw new BadRequestException("Invalid intent");
          }
        }
      }
    };

    return this.transaction(async (manager) => {
      const memory = new SnipetMemoryEntity({ knowledgeId, snipetId, type, payload });

      await this.repository(manager).save(memory);
      const policy = MEMORY_POLICIES[type];
      if (policy.embed) {
        const content = policy.extractText(payload);
        if (!content) throw new BadRequestException("Content is required");
        await this.embed(knowledgeId, memory, content);
      }
      return memory;
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
    const response: { lastNMemories: SnipetMemoryEntity[], query: SnipetVectorStorePayload[] } = {
      lastNMemories: [],
      query: []
    }
    if (options.lastNMemories) {
      response.lastNMemories = await this.repository().find({
        where: { snipetId },
        order: { createdAt: "DESC" },
        take: options.lastNMemories,
        relations: ["snipet"]
      })
    }

    if (options.query) {
      const query = options.query;
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
      response.query = searchQuery;
    }
    return response;
  }

  static withFilters(filters?: Record<string, string | number | boolean>): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      if (!filters) return currentOpts;
      return { ...currentOpts, filters: { ...currentOpts.filters, ...filters } };
    }
  }

  static withLastNMemories(lastNMessages?: number): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      if (!lastNMessages) return currentOpts;
      return { ...currentOpts, lastNMemories: lastNMessages };
    }
  }

  static withQuery(query?: string | { topK?: number, query: string }): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      if (!query) return currentOpts;
      return { ...currentOpts, query };
    }
  }

  protected buildSnipetSearchOptions(...opts: WithSnipetSearchOptions[]) {
    return buildOptions<WithSnipetSearchOptions, SnipetSearchOptions>({}, opts);
  }
}