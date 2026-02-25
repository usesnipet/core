import { ApiKeyEntity, KnowledgeEntity } from "@/entities";
import { ContentInfo, ModelInfo, StorageInfo } from "@/entities/asset.entity";
import { Field } from "@/shared/model";

export enum KnowledgeAssetType {
  FILE = "FILE",
  TEXT = "TEXT",
}

export enum KnowledgeAssetStatus {
  PENDING = "PENDING",
  INDEXING = "INDEXING",
  INDEXED = "INDEXED",
  FAILED = "FAILED",
}

export class KnowledgeAssetEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity", required: false })
  id?: string;

  @Field({ type: "date", description: "The timestamp when the entity was created", required: false })
  createdAt?: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated", required: false })
  updatedAt?: Date;

  @Field({ type: "date", description: "The timestamp of the deletion", required: false })
  deletedAt?: Date;

  @Field({ type: "object", additionalProperties: true, required: false, description: "The metadata of the asset" })
  metadata?: Record<string, any>;

  @Field({ type: "class", class: () => ApiKeyEntity, required: false })
  createdBy?: ApiKeyEntity;

  @Field({ type: "string", required: false, uuid: true })
  createdById?: string;

  @Field({ type: "string", uuid: true, description: "The unique identifier for the knowledge asset" })
  knowledgeId: string;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => ModelInfo, required: false })
  model?: ModelInfo;

  @Field({ type: "class", class: () => StorageInfo, required: false })
  storage?: StorageInfo;

  @Field({ type: "class", class: () => ContentInfo, required: false })
  content?: ContentInfo;

  @Field({ type: "enum", enum: KnowledgeAssetType })
  type: KnowledgeAssetType;

  @Field({ type: "enum", enum: KnowledgeAssetStatus, required: false })
  status?: KnowledgeAssetStatus;

  @Field({ type: "string", required: false, uuid: true })
  connectorId?: string;

  @Field({ type: "string", required: false, uuid: true })
  externalId?: string;

  @Field({ type: "string", required: false })
  error?: string;

  constructor(partial: Partial<KnowledgeAssetEntity>) {
    Object.assign(this, partial);
  }
}