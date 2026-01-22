import { FileProcessorService } from "@/infra/file-processor/file-processor.service";
import { StorageService } from "@/infra/storage/storage.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import streamToBlob from "stream-to-blob";
import { KnowledgeAssetService } from "./knowledge-asset.service";

export type FileIngestJobData = {
  metadata: Record<string, any>;
  knowledgeId: string;
  connectorId?: string;
  externalId?: string;
  path: string;
  extension: string;
  mimetype: string;
  originalname: string;
  saveFile: boolean;
  size: number;
};

@Processor(FileIngestJob.INGEST_KEY, { concurrency: 1 })
export class FileIngestJob extends WorkerHost {
  static INGEST_KEY = "file-ingest";
  private readonly logger = new Logger(FileIngestJob.name);

  @Inject() private readonly fileIndexer:           FileProcessorService;
  @Inject() private readonly vectorStore:           SourceVectorStoreService;
  @Inject() private readonly storageService:        StorageService;
  @Inject() private readonly knowledgeAssetService: KnowledgeAssetService;

  async process(job: Job<FileIngestJobData>): Promise<any> {
    const { data } = job;
    this.logger.debug(`Processing file "${data.path}"`);
    const readableStream = await this.storageService.getObject(data.path, { temp: true });
    if (!readableStream) return;

    const payloads = await this.fileIndexer.process(
      await streamToBlob(readableStream),
      {
        type: "file",
        size: data.size,
        extension: data.extension,
        mimeType: data.mimetype,
        originalName: data.originalname,
        fileMetadata: data.metadata,
      },
      data.knowledgeId,
      data.connectorId,
      data.externalId
    );

    if (payloads.length > 0) await this.vectorStore.add(payloads);
    const path = await this.storageService.confirmTempUpload(data.path);
    data.path = path;

    await this.knowledgeAssetService.saveFile(data);
    this.logger.log(`File "${data.path}" processed`);
  }

  @OnWorkerEvent("active")
  async onStart(job: Job<FileIngestJobData>) {
    this.logger.log("ingest started");
  }

  @OnWorkerEvent("completed")
  async onCompleted(job: Job<FileIngestJobData>) {
    this.logger.log("ingest completed");
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job<FileIngestJobData>, error: Error) {
    this.logger.log(error);
  }
}