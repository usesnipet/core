import { Job } from "bullmq";
import * as fs from "fs/promises";
import { Readable } from "stream";
import streamToBlob from "stream-to-blob";

import { ProcessorService } from "@/infra/processor/processor.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";

export type IngestJobData = {
  metadata: Record<string, any>;
  knowledgeId: string;
  connectorId: string;
  externalId?: string | null;
  path: string;
  extension: string;
  mimetype: string;
  originalname: string;
};

@Processor(IngestJob.INGEST_KEY, { concurrency: 1 })
export class IngestJob extends WorkerHost {
  static INGEST_KEY = "ingest";
  private readonly logger = new Logger(IngestJob.name);

  @Inject() private readonly processorService: ProcessorService;
  @Inject() private readonly vectorStore: SourceVectorStoreService;

  async process(job: Job<IngestJobData>): Promise<any> {
    const { data } = job;
    this.logger.debug(`Processing file "${data.path}"`);
    const buffer = await fs.readFile(data.path);

    const fragments = await this.processorService.process(
      data.connectorId,
      data.knowledgeId,
      await streamToBlob(Readable.from(buffer)),
      { 
        extension: data.extension,
        mimetype: data.mimetype,
        originalname: data.originalname,
        ...data.metadata,
      }
    );
    await  this.vectorStore.addFragments(fragments);
    this.logger.debug(`File "${data.path}" processed`);
  }
  
  @OnWorkerEvent("active")
  async onStart(job: Job<IngestJobData>) {
    this.logger.log("ingest started");
  }

  @OnWorkerEvent("completed")
  async onCompleted(job: Job<IngestJobData>) {
    this.logger.log("ingest completed");
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job<IngestJobData>, error: Error) {
    this.logger.log(error);
  }
}