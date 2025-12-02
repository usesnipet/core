import { SessionFragment, Fragments } from '@/fragment';

import { SearchOptions, VectorStore, WithSearchOptions } from './vector-store.service';

export abstract class SessionVectorStoreService extends VectorStore<SessionFragment> {
  abstract searchLastNMessages(sessionId: string, n: number): Promise<Fragments<SessionFragment>>;


  static withSessionId(sessionId: string): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, filters: { ...currentOpts.filters, sessionId } };
    }
  }
}
