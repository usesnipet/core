import { FileProcessorService } from "@/infra/file-processor/file-processor.service";
import { StorageService } from "@/infra/storage/storage.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { forwardRef, Inject, Logger, NotFoundException } from "@nestjs/common";
import { Job } from "bullmq";
import { KnowledgeAssetEntity, KnowledgeAssetStatus } from "./asset/knowledge-asset.entity";
import { KnowledgeAssetService } from "./knowledge-asset.service";
import { FILE_INGEST_QUEUE } from "./file-ingest.constants";

@Processor(FILE_INGEST_QUEUE, { concurrency: 1 })
export class FileIngestJob extends WorkerHost {
  private readonly logger = new Logger(FileIngestJob.name);

  @Inject() private readonly fileIndexer:           FileProcessorService;
  @Inject() private readonly vectorStore:           SourceVectorStoreService;
  @Inject() private readonly storageService:        StorageService;
  @Inject() private readonly knowledgeAssetService: KnowledgeAssetService;

  async process(job: Job<KnowledgeAssetEntity>): Promise<any> {
    const { data } = job;
    if (!data.storage || !data.storage.path) throw new NotFoundException("File not found");
    const tempPath = data.storage.path;
    this.logger.debug(`Processing file "${tempPath}"`);
    const file = await this.storageService.getObject(tempPath, { temp: true });
    if (!file) return;

    const payloads = await this.fileIndexer.process(file, data);

    if (payloads.length > 0) await this.vectorStore.add(payloads);

    if (data.storage.persisted) data.storage.path = await this.storageService.confirmTempUpload(tempPath);
    else data.storage.path = undefined;
    await this.knowledgeAssetService.update(data.id, data);
  }

  @OnWorkerEvent("completed")
  async onCompleted(job: Job<KnowledgeAssetEntity>) {
    const id = job.data.id;
    const asset = await this.knowledgeAssetService.findByID(id);
    if (!asset) return;
    asset.status = KnowledgeAssetStatus.INDEXED;
    await this.knowledgeAssetService.update(id, asset);

    this.logger.debug(`File "${id}" processed`);
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job<KnowledgeAssetEntity>, error: Error) {
    const id = job.data.id;
    const asset = await this.knowledgeAssetService.findByID(id);
    if (!asset) return;
    asset.status = KnowledgeAssetStatus.FAILED;
    await this.knowledgeAssetService.update(id, asset);

    this.logger.error(error);
  }
}