import { AssetService } from "@/infra/assets/assets.service";
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AssetDomain, AssetEntity, AssetSource, ModelInfo, StorageInfo } from "@/entities/asset.entity";
import { EntityManager, FindOptionsWhere } from "typeorm";
import { KnowledgeAssetEntity, KnowledgeAssetStatus, KnowledgeAssetType } from "./asset/knowledge-asset.entity";
import { ICRUDService } from "@/shared/service.interface";
import { FileIngestDto, FileIngestResponseDto } from "./dto/ingest.dto";
import { randomUUID } from "crypto";
import { IngestJobStateResponseDto, IngestJobState } from "./dto/job-state.dto";
import { StorageService } from "@/infra/storage/storage.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { FILE_INGEST_QUEUE } from "./file-ingest.constants";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";

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

@Injectable()
export class KnowledgeAssetService
  extends AssetService<KnowledgeAssetEntity> implements ICRUDService<KnowledgeAssetEntity>
  {
  logger = new Logger(KnowledgeAssetService.name);

  domain = AssetDomain.KNOWLEDGE;

  @Inject() private readonly storageService: StorageService;
  @Inject() private readonly vectorStore:    SourceVectorStoreService;

  @InjectQueue(FILE_INGEST_QUEUE) private readonly ingestQueue: Queue<KnowledgeAssetEntity>;

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

  async ingestFile(
    { buffer, originalname, mimetype }: Express.Multer.File,
    { knowledgeId, metadata, saveFile, externalId }: FileIngestDto
  ): Promise<FileIngestResponseDto> {
    console.log(originalname);

    const extension = originalname.split('.').pop();
    if (!extension) throw new BadRequestException("Failed to ingest content");
    const path = await this.storageService.putObject(
      `source/${knowledgeId}/${randomUUID()}.${extension}`,
      buffer,
      mimetype,
      { temp: true }
    );

    const asset = await this.saveFile({
      path,
      extension,
      knowledgeId,
      metadata,
      mimeType: mimetype,
      originalName: originalname,
      externalId,
      status: KnowledgeAssetStatus.PENDING,
      size: buffer.byteLength,
      storage: {
        persisted: saveFile,
        path,
        provider: this.storageService.providerName()
      }
    });

    try {
      const job = await this.ingestQueue.add("", asset, { jobId: randomUUID() });
      if (!job.id) throw new BadRequestException("Failed to ingest content");
      return new FileIngestResponseDto(job.id);
    } catch (error) {
      asset.status = KnowledgeAssetStatus.FAILED;
      asset.error = error.message;
      await this.update(asset.id, asset);
      throw error;
    }
  }

  async getIngestStatus(id: string): Promise<IngestJobStateResponseDto> {
    const state = await this.ingestQueue.getJobState(id);
    let jobState: IngestJobState;
    switch (state) {
      case "waiting":
      case "waiting-children":
      case "delayed":
      case "unknown":
        jobState = IngestJobState.PENDING;
      case "active":
      case "prioritized":
        jobState = IngestJobState.IN_PROGRESS;
      case "completed":
        jobState = IngestJobState.COMPLETED;
      case "failed":
        jobState = IngestJobState.FAILED;
      default:
        jobState = IngestJobState.FAILED;
    }

    return new IngestJobStateResponseDto(jobState);
  }

  override delete(
    id: string | FindOptionsWhere<KnowledgeAssetEntity>,
    manager?: EntityManager
  ): Promise<void> {
    return this.transaction(async (manager) => {
      const asset = await this.findFirst({
        where: typeof id === "string" ? { id } : id,
      }, manager);
      if (!asset) throw new NotFoundException(`Asset with id ${id} not found`);

      // Remove from vector store
      await this.vectorStore.removeBy("assetId", asset.id);

      // remove from storage
      if (asset?.storage?.persisted) {
        if (asset.storage.path) {
          this.logger.debug("Deleting file");
          await this.storageService.delete(asset.storage.path);
          this.logger.debug("Deleting file done");
        } else {
          this.logger.warn(`File persisted without a path ${asset.id}`);
        }
      }

      // remove from database
      await super.delete(id, manager);
    }, manager);
  }
}