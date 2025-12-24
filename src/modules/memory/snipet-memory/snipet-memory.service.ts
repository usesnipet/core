import { SnipetMessageEntity } from "@/entities";
import { Fragments, SnipetFragment } from "@/fragment";
import { SnipetVectorStoreService } from "@/infra/vector/snipet-vector-store.service";
import { buildOptions } from "@/utils/build-options";
import { Injectable } from "@nestjs/common";
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

  constructor(private readonly snipetVectorStore: SnipetVectorStoreService) {}

  private messageToFragment(
    knowledgeId: string,
    message: SnipetMessageEntity
  ): SnipetFragment {
    return SnipetFragment.fromObject({
      id: message.id,
      createdAt: message.createdAt,
      role: message.role,
      knowledgeId: knowledgeId,
      snipetId: message.snipetId,
      metadata: {},
      updatedAt: message.updatedAt,
      content: message.content,
    });
  }

  async add(knowledgeId: string, message: SnipetMessageEntity) {
    await this.snipetVectorStore.addFragments(this.messageToFragment(knowledgeId, message));
  }

  async remove(knowledgeId: string, message: SnipetMessageEntity) {
    await this.snipetVectorStore.deleteFragments(this.messageToFragment(knowledgeId, message));
  }

  async search(knowledgeId: string, snipetId: string, ...opts: WithSnipetSearchOptions[]) {
    const options = this.buildSnipetSearchOptions(...opts);
    const response: { lastNMessages: SnipetMessageEntity[], searchQuery: Fragments<SnipetFragment> } = {
      lastNMessages: [],
      searchQuery: Fragments.fromFragmentArray([]),
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
      const searchQuery = await this.snipetVectorStore.search(
        knowledgeId,
        SnipetVectorStoreService.withSnipetId(snipetId),
        SnipetVectorStoreService.withQuery(options.searchQuery),
        options.filters && SnipetVectorStoreService.withFilters(options.filters)
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
