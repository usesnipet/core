import { VectorStorePayload } from "./vector-store-payload";

export class SnipetVectorStorePayload extends VectorStorePayload {
  snipetId: string;
  knowledgeId: string;
  
  constructor(payload: Omit<SnipetVectorStorePayload, 'createdAt' | 'updatedAt'> & { createdAt?: Date, updatedAt?: Date }) {
    super(payload);
    this.knowledgeId = payload.knowledgeId;
    this.snipetId = payload.snipetId;
  }
}