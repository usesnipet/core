import { AssetEntity } from "@/entities/asset.entity";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export enum KnowledgeAssetType {
  FILE = "FILE",
  TEXT = "TEXT",
}

export class KnowledgeAssetDto extends PickType(AssetEntity, [
  "id",
  "createdAt", "updatedAt", "deletedAt",
  "metadata",
  "createdBy", "createdById",
  "lifecycle",
  "knowledgeId", "knowledge",
  "model", "storage", "content"
]) {
  @Field({ type: "enum", enum: KnowledgeAssetType })
  type: KnowledgeAssetType;


  constructor(partial: Partial<KnowledgeAssetDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}