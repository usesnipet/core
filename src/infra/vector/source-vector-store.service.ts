import { VectorStore } from "./vector-store.service";
import { SourceVectorStorePayload } from "./payload/source-vector-store-payload";

export abstract class SourceVectorStoreService extends VectorStore<SourceVectorStorePayload> {
}
