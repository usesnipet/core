import { SearchOptions, VectorStore, WithSearchOptions } from './vector-store.service';
import { SnipetVectorStorePayload } from './payload/snipet-vector-store-payload';

export abstract class SnipetVectorStoreService extends VectorStore<SnipetVectorStorePayload> {
  static withSnipetId(snipetId: string): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, filters: { ...currentOpts.filters, snipetId } };
    }
  }
}
