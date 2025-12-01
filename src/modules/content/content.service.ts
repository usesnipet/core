
import { Queue } from "bullmq";
import { randomUUID } from "crypto";

import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

import { IngestDto, IngestResponseDto } from "./dto/ingest.dto";
import { JobState, JobStateResponseDto } from "./dto/job-state.dto";
import { IngestJob, IngestJobData } from "./ingest.job";

@Injectable()
export class ContentService {
  logger = new Logger(ContentService.name);
  @InjectQueue(IngestJob.INGEST_KEY) private readonly ingestQueue: Queue<IngestJobData>;

  async ingest(data: IngestDto) {
    const ext = data.file.originalname.split('.').pop();
    if (!ext) throw new BadRequestException("Failed to ingest content");
    const job = await this.ingestQueue.add("", {
      connectorId: data.connectorId,
      knowledgeId: data.knowledgeId,
      metadata: data.metadata,
      path: data.file.path,
      mimetype: data.file.mimetype,
      originalname: data.file.originalname,
      extension: ext,
      externalId: data.externalId,
    }, { jobId: randomUUID() });
    if (!job.id) throw new BadRequestException("Failed to ingest content");
    return new IngestResponseDto(job.id);
  }

  async getStatus(id: string): Promise<JobStateResponseDto> {
    const state = await this.ingestQueue.getJobState(id);
    let jobState: JobState;
    switch (state) {
      case "waiting":
      case "waiting-children":
      case "delayed":
      case "unknown":
        jobState = JobState.PENDING;
      case "active":
      case "prioritized":
        jobState = JobState.IN_PROGRESS;
      case "completed":
        jobState = JobState.COMPLETED;
      case "failed":
        jobState = JobState.FAILED;
      default:
        jobState = JobState.FAILED;
    }

    return new JobStateResponseDto(jobState);
  }
}