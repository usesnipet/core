import { VectorStorePayload } from "./vector-store-payload";

export class SourceVectorStorePayload extends VectorStorePayload {
  seqId?: number;
  assetId: string;
  knowledgeId: string;
  connectorId?: string;
  externalId?: string;

  constructor(payload: Omit<SourceVectorStorePayload, 'createdAt' | 'updatedAt'> & { createdAt?: Date, updatedAt?: Date }) {
    super(payload);
    Object.assign(this, payload);
  }
}