import { AssetService } from "@/infra/assets/assets.service";
import { Logger } from "@nestjs/common";
import { AssetEntity, AssetType } from "@/entities/asset.entity";
import { SnipetAssetDto, SnipetAssetType } from "./dto/snipet-asset.dto";

export class SnipetAssetService extends AssetService<SnipetAssetDto> {
  logger = new Logger(SnipetAssetService.name);

  private knowledgeAssetTypeToAssetType(type: SnipetAssetType): AssetType {
    switch (type) {
      case SnipetAssetType.AI_RESPONSE:
        return AssetType.AI_RESPONSE;
      case SnipetAssetType.PROMPT:
        return AssetType.PROMPT;
      case SnipetAssetType.SEARCH_QUERY:
        return AssetType.SEARCH_QUERY;
      case SnipetAssetType.SEARCH_RESULT:
        return AssetType.SEARCH_RESULT;
      case SnipetAssetType.USER_QUESTION:
        return AssetType.USER_QUESTION;
      default:
        throw new Error("Invalid asset type");
    }
  }

  private assetTypeToKnowledgeAssetType(type: AssetType): SnipetAssetType {
    switch (type) {
      case AssetType.AI_RESPONSE:
        return SnipetAssetType.AI_RESPONSE;
      case AssetType.PROMPT:
        return SnipetAssetType.PROMPT;
      case AssetType.SEARCH_QUERY:
        return SnipetAssetType.SEARCH_QUERY;
      case AssetType.SEARCH_RESULT:
        return SnipetAssetType.SEARCH_RESULT;
      case AssetType.USER_QUESTION:
        return SnipetAssetType.USER_QUESTION;
      default:
        throw new Error("Invalid asset type");
    }
  }
  
  fromEntity(entity: AssetEntity): SnipetAssetDto {
    return new SnipetAssetDto({
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      createdBy: entity.createdBy,
      createdById: entity.createdById,
      knowledge: entity.knowledge,
      knowledgeId: entity.knowledgeId,
      lifecycle: entity.lifecycle,
      metadata: entity.metadata,
      model: entity.model,
      storage: entity.storage,
      type: this.assetTypeToKnowledgeAssetType(entity.type),
      snipetId: entity.snipetId,
      snipet: entity.snipet
    })
  }

  toEntity(asset: SnipetAssetDto): AssetEntity {
    return new AssetEntity({
      type: this.knowledgeAssetTypeToAssetType(asset.type),
      domain: this.domain,
      content: asset.content,
      id: asset.id,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      metadata: asset.metadata,
      createdById: asset.createdById,
      createdBy: asset.createdBy,
      deletedAt: asset.deletedAt,
      knowledge: asset.knowledge,
      knowledgeId: asset.knowledgeId,
      lifecycle: asset.lifecycle,
      model: asset.model,
      storage: asset.storage,
      snipetId: asset.snipetId,
      snipet: asset.snipet,
      source: asset.source
    });
  }

  
}