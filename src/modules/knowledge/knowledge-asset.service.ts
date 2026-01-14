import { AssetService } from "@/infra/assets/assets.service";
import { KnowledgeAssetDto, KnowledgeAssetType } from "./dto/knowledge-asset.dto";
import { Logger } from "@nestjs/common";
import { AssetDomain, AssetEntity, AssetType } from "@/entities/asset.entity";
import { EntityManager } from "typeorm";
import { FileIngestDto } from "./dto/ingest.dto";
import { FileIngestJobData } from "./file-ingest.job";

export class KnowledgeAssetService extends AssetService<KnowledgeAssetDto> {
  logger = new Logger(KnowledgeAssetService.name);

  domain = AssetDomain.SNIPET;

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
      model: asset.model,
      storage: asset.storage,
    });
  }

  // private save(asset: KnowledgeAssetDto, manager?: EntityManager) {
  //   return this.transaction(async (manager) => {
  //     if (opts.persistText) {
  //       const text = opts.extractText(asset);
  //       if (!asset.content) asset.content = {};
  //       asset.content.text = text;
  //       asset.content.hash = this.hash(text);
  //       asset.content.sizeBytes = Buffer.byteLength(text);
  //       asset = await super.create(asset, manager);
  //     }
  //     if (opts.embed) await this.embed(asset, opts.extractText);

  //     return asset;
  //   }, opts.manager);
  // }

  async saveFile(data: FileIngestJobData, manager?: EntityManager) {
    const asset = new KnowledgeAssetDto({
      knowledgeId: data.knowledgeId,
      type: KnowledgeAssetType.FILE,
      metadata: {
        ...data.metadata,
        externalId: data.externalId,
        connectorId: data.connectorId,
      },
      storage: {
        provider: "s3",
        key: data.path,
        persisted: true
      },
    })
  }
}