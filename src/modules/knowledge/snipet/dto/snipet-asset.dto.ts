import { AssetEntity } from "@/entities/asset.entity";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export enum SnipetAssetType {
  USER_INPUT = "USER_INPUT",
  AI_RESPONSE = "AI_RESPONSE",
  CONTEXT = "CONTEXT",
  ACTION = "ACTION",
}

export class SnipetAssetDto extends PickType(AssetEntity, [
  "id",
  "createdAt", "updatedAt", "deletedAt",
  "metadata",
  "createdBy", "createdById",
  "knowledgeId", "knowledge",
  "snipet",
  "execution", "executionId",
  "model", "storage", "content", "source"
]) {
  @Field({ type: "enum", enum: SnipetAssetType })
  type: SnipetAssetType;

  @Field({ type: "string", uuid: true })
  snipetId: string;

  constructor(partial: Partial<SnipetAssetDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}