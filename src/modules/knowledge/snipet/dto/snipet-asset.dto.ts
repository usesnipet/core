import { AssetEntity } from "@/entities/asset.entity";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export enum SnipetAssetType {
  USER_QUESTION = "USER_QUESTION",
  AI_RESPONSE = "AI_RESPONSE",
  PROMPT = "PROMPT",
  SEARCH_QUERY = "SEARCH_QUERY",
  SEARCH_RESULT = "SEARCH_RESULT",
}

export class SnipetAssetDto extends PickType(AssetEntity, [
  "id",
  "createdAt", "updatedAt", "deletedAt",
  "metadata",
  "createdBy", "createdById",
  "lifecycle",
  "knowledgeId", "knowledge",
  "snipetId", "snipet",
  "model", "storage", "content", "source"
]) {
  @Field({ type: "enum", enum: SnipetAssetType })
  type: SnipetAssetType;

  constructor(partial: Partial<SnipetAssetDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}