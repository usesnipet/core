import { SessionMessageEntity } from "@/entities";
import { Fragments, SessionFragment } from "@/fragment";
import { SessionVectorStoreService } from "@/infra/vector/session-vector-store.service";
import { buildOptions } from "@/utils/build-options";
import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager, Repository } from "typeorm";

export type SessionSearchOptions = {
  lastNMessages?: number;
  searchQuery?: string | { topK?: number, query: string };
  filters?: Record<string, string | number | boolean>;
}

export type WithSessionSearchOptions = (currentOpts: Partial<SessionSearchOptions>) =>  Partial<SessionSearchOptions>;


@Injectable()
export class SessionMemoryService {
  private readonly dataSource: DataSource;

  sessionMessageRepository(manager?: EntityManager): Repository<SessionMessageEntity> {
    return manager ?
      manager.getRepository(SessionMessageEntity) :
      this.dataSource.getRepository(SessionMessageEntity);
  }

  constructor(private readonly sessionVectorStore: SessionVectorStoreService) {}

  private messageToFragment(
    knowledgeId: string,
    message: SessionMessageEntity
  ): SessionFragment {
    return SessionFragment.fromObject({
      id: message.id,
      createdAt: message.createdAt,
      role: message.role,
      knowledgeId: knowledgeId,
      sessionId: message.sessionId,
      metadata: {},
      updatedAt: message.updatedAt,
      content: message.content,
    });
  }

  async add(knowledgeId: string, message: SessionMessageEntity) {
    await this.sessionVectorStore.addFragments(this.messageToFragment(knowledgeId, message));
  }

  async remove(knowledgeId: string, message: SessionMessageEntity) {
    await this.sessionVectorStore.deleteFragments(this.messageToFragment(knowledgeId, message));
  }

  async search(knowledgeId: string, sessionId: string, ...opts: WithSessionSearchOptions[]) {
    const options = this.buildSessionSearchOptions(...opts);
    const response: { lastNMessages: SessionMessageEntity[], searchQuery: Fragments<SessionFragment> } = {
      lastNMessages: [],
      searchQuery: Fragments.fromFragmentArray([]),
    }
    if (options.lastNMessages) {
      response.lastNMessages = await this.sessionMessageRepository().find({
        where: { sessionId },
        order: { createdAt: "DESC" },
        take: options.lastNMessages,
        relations: ["session"]
      })
    }

    if (options.searchQuery) {
      const searchQuery = await this.sessionVectorStore.search(
        knowledgeId,
        SessionVectorStoreService.withSessionId(sessionId),
        SessionVectorStoreService.withQuery(options.searchQuery),
        options.filters && SessionVectorStoreService.withFilters(options.filters)
      )
      response.searchQuery = searchQuery;
    }
    return response;
  }



  static withFilters(filters: Record<string, string | number | boolean>): WithSessionSearchOptions {
    return (currentOpts: Partial<SessionSearchOptions>) => {
      return { ...currentOpts, filters: { ...currentOpts.filters, ...filters } };
    }
  }

  static withLastNMessages(lastNMessages: number): WithSessionSearchOptions {
    return (currentOpts: Partial<SessionSearchOptions>) => {
      return { ...currentOpts, lastNMessages };
    }
  }

  static withSearchQuery(searchQuery: string): WithSessionSearchOptions {
    return (currentOpts: Partial<SessionSearchOptions>) => {
      return { ...currentOpts, searchQuery };
    }
  }

  protected buildSessionSearchOptions(...opts: WithSessionSearchOptions[]) {
    return buildOptions<WithSessionSearchOptions, SessionSearchOptions>({}, opts);
  }
}
