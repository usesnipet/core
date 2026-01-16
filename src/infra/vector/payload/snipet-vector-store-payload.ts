import { VectorStorePayload } from "./vector-store-payload";

export class SnipetVectorStorePayload extends VectorStorePayload {
  snipetId: string;
  knowledgeId: string;
  role: string;

  constructor(
    payload: Omit<SnipetVectorStorePayload, 'createdAt' | 'updatedAt' | 'id'> & {
      createdAt?: Date,
      updatedAt?: Date,
      id?: string
    }
  ) {
    super(payload);
    Object.assign(this, payload);
  }
}