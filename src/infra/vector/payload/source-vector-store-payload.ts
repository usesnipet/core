import { VectorStorePayload } from "./vector-store-payload";

export class SourceVectorStorePayload extends VectorStorePayload {
  seqId?: number;
  knowledgeId: string;
  connectorId: string;
  externalId?: string;
  
  constructor(payload: Omit<SourceVectorStorePayload, 'createdAt' | 'updatedAt'> & { createdAt?: Date, updatedAt?: Date }) {
    super(payload);
    this.seqId = payload.seqId;
    this.knowledgeId = payload.knowledgeId;
    this.connectorId = payload.connectorId;
    this.externalId = payload.externalId;
  }
}