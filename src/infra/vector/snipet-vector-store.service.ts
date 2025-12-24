import { SnipetFragment, Fragments } from '@/fragment';

import { SearchOptions, VectorStore, WithSearchOptions } from './vector-store.service';

export abstract class SnipetVectorStoreService extends VectorStore<SnipetFragment> {
  static withSnipetId(snipetId: string): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, filters: { ...currentOpts.filters, snipetId } };
    }
  }
}
