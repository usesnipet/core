import {
  AssetSource,
  ContentInfo,
  ModelInfo,
  StorageInfo
} from "@/entities/asset.entity";
import { ExecutionEntity } from "@/entities/execution.entity";
import { ApiKeyEntity, KnowledgeEntity, SnipetEntity } from "@/entities";
import { Field } from "@/shared/model";

export enum SnipetAssetType {
  USER_INPUT = "USER_INPUT",
  AI_RESPONSE = "AI_RESPONSE",
  CONTEXT = "CONTEXT",
  ACTION = "ACTION",
}

export class SnipetAssetDto {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  id: string;

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  updatedAt: Date;

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

  @Field({ type: "class", class: () => SnipetEntity, required: false })
  snipet?: SnipetEntity;

  @Field({ type: "class", class: () => ExecutionEntity, required: false })
  execution?: ExecutionEntity;

  @Field({ type: "string", required: false, uuid: true })
  executionId?: string;

  @Field({ type: "class", class: () => ModelInfo, required: false })
  model?: ModelInfo;

  @Field({ type: "class", class: () => StorageInfo, required: false })
  storage?: StorageInfo;

  @Field({ type: "class", class: () => ContentInfo, required: false })
  content?: ContentInfo;

  @Field({ type: "enum", enum: AssetSource, description: "The source of the asset" })
  source: AssetSource;

  @Field({ type: "enum", enum: SnipetAssetType })
  type: SnipetAssetType;

  @Field({ type: "string", uuid: true })
  snipetId: string;

  constructor(partial: Partial<SnipetAssetDto>) {
    Object.assign(this, partial);
  }
}