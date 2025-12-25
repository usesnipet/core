import { randomUUID } from "crypto";

export class VectorStorePayload {
  id: string;
  content: string;
  fullContent: string;
  dense: number[];
  createdAt: Date;
  updatedAt: Date;
  metadata: any;

  constructor(
    payload: Omit<VectorStorePayload, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      createdAt?: Date,
      updatedAt?: Date
    }
  ) {
    this.id = payload.id ?? randomUUID();
    this.content = payload.content;
    this.fullContent = payload.fullContent;
    this.dense = payload.dense;
    this.metadata = payload.metadata;
    this.createdAt = payload.createdAt ?? new Date();
    this.updatedAt = payload.updatedAt ?? new Date();
  }
}