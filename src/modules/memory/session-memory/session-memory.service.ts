import { SessionMessageEntity } from '@/entities';
import { SessionFragment, Fragments } from '@/fragment';
import { SessionVectorStoreService } from '@/infra/vector/session-vector-store.service';
import { buildOptions } from '@/utils/build-options';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

export type SessionSearchOptions = {
  lastNMessages?: number;
  searchQuery?: string | { topK?: number, query: string };
  filters?: Record<string, string | number | boolean>;
}

export type WithSessionSearchOptions = (currentOpts: Partial<SessionSearchOptions>) =>  Partial<SessionSearchOptions>;


@Injectable()
export class SessionMemoryService {
  private readonly logger = new Logger(SessionMemoryService.name);

  constructor(
    private readonly chatVectorStore: SessionVectorStoreService,
    @Inject(forwardRef(() => MessageService)) private readonly messageService: MessageService
  ) {}

  private async messageToFragment(
    knowledgeId: string,
    message: SessionMessageEntity
  ): Promise<SessionFragment> {
    return SessionFragment.fromObject({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      role: message.role,
      knowledgeId: knowledgeId,
      sessionId: message.sessionId,
      metadata: {},
      updatedAt: message.updatedAt
    });
  }

  async add(knowledgeId: string, message: SessionMessageEntity) {
    await this.chatVectorStore.addFragments(
      knowledgeId,
      await this.messageToFragment(knowledgeId, message)
    );
  }

  async remove(knowledgeId: string, message: SessionMessageEntity) {
    await this.chatVectorStore.deleteFragments(
      knowledgeId,
      await this.messageToFragment(knowledgeId, message)
    );
  }

  async search(knowledgeId: string, chatId: string, ...opts: WithSessionSearchOptions[]) {
    const options = this.buildSessionSearchOptions(...opts);
    const response: { lastNMessages: MessageEntity[], searchQuery: Fragments<SessionFragment> } = {
      lastNMessages: [],
      searchQuery: Fragments.fromFragmentArray([]),
    }
    if (options.lastNMessages) {
      response.lastNMessages = await this.messageService.findLastNMessages(chatId, options.lastNMessages);
    }

    if (options.searchQuery) {
      const searchQuery = await this.chatVectorStore.search(
        knowledgeId,
        SessionVectorStoreService.withSessionId(chatId),
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
