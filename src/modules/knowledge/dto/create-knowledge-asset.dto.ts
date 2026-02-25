import { ContentInfo, ModelInfo, StorageInfo } from "@/entities/asset.entity";
import { Field } from "@/shared/model";
import { KnowledgeAssetStatus, KnowledgeAssetType } from "../asset/knowledge-asset.entity";

export class CreateKnowledgeAssetDto {
  @Field({ type: "object", additionalProperties: true, required: false, description: "The metadata of the asset" })
  metadata?: Record<string, any>;

  @Field({ type: "string", uuid: true, description: "The unique identifier for the knowledge asset", required: true })
  knowledgeId: string;

  @Field({ type: "class", class: () => ModelInfo, required: false })
  model?: ModelInfo;

  @Field({ type: "class", class: () => StorageInfo, required: false })
  storage?: StorageInfo;

  @Field({ type: "enum", enum: KnowledgeAssetType, required: true })
  type: KnowledgeAssetType;

  @Field({ type: "enum", enum: KnowledgeAssetStatus, required: false })
  status?: KnowledgeAssetStatus;

  @Field({ type: "string", required: false, uuid: true })
  connectorId?: string;

  @Field({ type: "string", required: false, uuid: true })
  externalId?: string;

  constructor(partial: Partial<CreateKnowledgeAssetDto>) {
    Object.assign(this, partial);
  }
}