import { FileProcessorService } from "@/infra/file-processor/file-processor.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import * as fs from "fs/promises";
import { Readable } from "stream";
import streamToBlob from "stream-to-blob";

export type FileIngestJobData = {
  metadata: Record<string, any>;
  knowledgeId: string;
  connectorId?: string;
  externalId?: string;
  path: string;
  extension: string;
  mimetype: string;
  originalname: string;
};

@Processor(FileIngestJob.INGEST_KEY, { concurrency: 1 })
export class FileIngestJob extends WorkerHost {
  static INGEST_KEY = "file-ingest";
  private readonly logger = new Logger(FileIngestJob.name);

  @Inject() private readonly fileIndexer: FileProcessorService;
  @Inject() private readonly vectorStore: SourceVectorStoreService;

  async process(job: Job<FileIngestJobData>): Promise<any> {
    const { data } = job;
    this.logger.debug(`Processing file "${data.path}"`);
    const buffer = await fs.readFile(data.path);

    const payloads = await this.fileIndexer.process(
      await streamToBlob(Readable.from(buffer)),
      {
        type: "file",
        size: buffer.byteLength,
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

    await fs.unlink(data.path);
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