import { AssetService } from "@/infra/assets/assets.service";
import { Logger } from "@nestjs/common";
import { AssetDomain, AssetEntity, AssetSource, ModelInfo, StorageInfo } from "@/entities/asset.entity";
import { EntityManager } from "typeorm";
import { KnowledgeAssetEntity, KnowledgeAssetStatus, KnowledgeAssetType } from "./asset/knowledge-asset.entity";

export type CreateFileData = {
  originalName: string;
  size: number;
  extension: string;
  mimeType: string;
  path: string;
  status: KnowledgeAssetStatus;
  knowledgeId: string;
  metadata: Record<string, any>;
  connectorId?: string;
  externalId?: string;
  model?: ModelInfo;
  storage?: StorageInfo;
}

export class KnowledgeAssetService extends AssetService<KnowledgeAssetEntity> {
  logger = new Logger(KnowledgeAssetService.name);

  domain = AssetDomain.KNOWLEDGE;
  fromEntity(entity: AssetEntity): KnowledgeAssetEntity {
    return new KnowledgeAssetEntity({
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      createdBy: entity.createdBy,
      status: entity.extraData?.status,
      connectorId: entity.extraData?.connectorId,
      externalId: entity.extraData?.externalId,
      error: entity.extraData?.error,
      createdById: entity.createdById,
      knowledge: entity.knowledge,
      knowledgeId: entity.knowledgeId,
      metadata: entity.metadata,
      model: entity.model,
      storage: entity.storage,
      type: entity.type as KnowledgeAssetType,
    })
  }

  toEntity(asset: KnowledgeAssetEntity): AssetEntity {
    return new AssetEntity({
      type: asset.type,
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
      model: asset.model,
      storage: asset.storage,
      extraData: {
        status: asset.status,
        connectorId: asset.connectorId,
        externalId: asset.externalId,
        error: asset.error
      },
      source: AssetSource.SYSTEM
    });
  }

  async saveFile(
    data: CreateFileData,
    manager?: EntityManager
  ) {
    const asset = new KnowledgeAssetEntity({
      knowledgeId: data.knowledgeId,
      type: KnowledgeAssetType.FILE,
      metadata: data.metadata,
      model: data.model,
      connectorId: data.connectorId,
      externalId: data.externalId,
      content: {
        hash: this.hash(`${data.originalName}-${data.size}-${data.extension}-${data.mimeType}`),
        text: data.originalName,
        mimeType: data.mimeType,
        sizeBytes: data.size
      },
      storage: data.storage,
      status: data.status,
    });
    return super.create(asset, manager);
  }
}