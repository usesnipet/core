import { FileProcessorService } from "@/infra/file-processor/file-processor.service";
import { StorageService } from "@/infra/storage/storage.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { Job } from "bullmq";
import streamToBlob from "stream-to-blob";
import { KnowledgeAssetService } from "./knowledge-asset.service";
import { KnowledgeAssetEntity, KnowledgeAssetStatus } from "./asset/knowledge-asset.entity";

@Processor(FileIngestJob.INGEST_KEY, { concurrency: 1 })
export class FileIngestJob extends WorkerHost {
  static INGEST_KEY = "file-ingest";
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
    const readableStream = await this.storageService.getObject(tempPath, { temp: true });
    if (!readableStream) return;

    const payloads = await this.fileIndexer.process(await streamToBlob(readableStream), data);

    if (payloads.length > 0) await this.vectorStore.add(payloads);

    if (data.storage.persisted) data.storage.path = await this.storageService.confirmTempUpload(tempPath);
    else data.storage.path = undefined;
    data.status = KnowledgeAssetStatus.INDEXED;

    await this.knowledgeAssetService.update(data.id, data);

    this.logger.log(`File "${data.storage.path}" processed`);
  }

  @OnWorkerEvent("active")
  async onStart(job: Job<KnowledgeAssetEntity>) {
    this.logger.log("ingest started");
  }

  @OnWorkerEvent("completed")
  async onCompleted(job: Job<KnowledgeAssetEntity>) {
    this.logger.log("ingest completed");
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job<KnowledgeAssetEntity>, error: Error) {
    this.logger.log(error);
  }
}