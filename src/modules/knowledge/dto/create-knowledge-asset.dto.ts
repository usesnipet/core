import { PickType } from "@nestjs/swagger";
import { KnowledgeAssetEntity } from "../asset/knowledge-asset.entity";

export class CreateKnowledgeAssetDto extends PickType(KnowledgeAssetEntity, [
  "metadata",
  "knowledgeId",
  "model", "storage", "type", "status",
  "connectorId", "externalId"
]) {
  constructor(partial: Partial<CreateKnowledgeAssetDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}