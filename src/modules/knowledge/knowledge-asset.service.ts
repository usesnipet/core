import { AssetService } from "@/infra/assets/assets.service";
import { KnowledgeAssetDto, KnowledgeAssetType } from "./dto/knowledge-asset.dto";
import { Logger } from "@nestjs/common";
import { AssetEntity, AssetType } from "@/entities/asset.entity";

export class KnowledgeAssetService extends AssetService<KnowledgeAssetDto> {
  logger = new Logger(KnowledgeAssetService.name);

  private knowledgeAssetTypeToAssetType(type: KnowledgeAssetType): AssetType {
    switch (type) {
      case KnowledgeAssetType.FILE:
        return AssetType.FILE;
      case KnowledgeAssetType.TEXT:
        return AssetType.TEXT;
      default:
        return AssetType.TEXT;
    }
  }
  private assetTypeToKnowledgeAssetType(type: AssetType): KnowledgeAssetType {
    switch (type) {
      case AssetType.FILE:
        return KnowledgeAssetType.FILE;
      case AssetType.TEXT:
        return KnowledgeAssetType.TEXT;
      default:
        return KnowledgeAssetType.TEXT;
    }
  }
  
  fromEntity(entity: AssetEntity): KnowledgeAssetDto {
    return new KnowledgeAssetDto({
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
    })
  }

  toEntity(asset: KnowledgeAssetDto): AssetEntity {
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
    });
  }
}