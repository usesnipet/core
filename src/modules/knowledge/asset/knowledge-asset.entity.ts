import { AssetEntity } from "@/entities/asset.entity";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

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

export class KnowledgeAssetEntity extends PickType(AssetEntity, [
  "id",
  "createdAt", "updatedAt", "deletedAt",
  "metadata",
  "createdBy", "createdById",
  "knowledgeId", "knowledge",
  "model", "storage", "content",
]) {
  @Field({ type: "enum", enum: KnowledgeAssetType })
  type: KnowledgeAssetType;

  @Field({ type: "enum", enum: KnowledgeAssetStatus })
  status?: KnowledgeAssetStatus;

  @Field({ type: "string", required: false, uuid: true })
  connectorId?: string;

  @Field({ type: "string", required: false, uuid: true })
  externalId?: string;

  @Field({ type: "string", required: false })
  error?: string;

  constructor(partial: Partial<KnowledgeAssetEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}