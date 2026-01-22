import { KbPermission, KnowledgeEntity } from "@/entities";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SourceVectorStorePayload } from "@/infra/vector/payload/source-vector-store-payload";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { FilterOptions } from "@/shared/filter-options";
import { Service } from "@/shared/service";
import { buildOptions } from "@/utils/build-options";
import { BadRequestException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { EntityManager, FindOneOptions } from "typeorm";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";
import { ApiKeyService } from "../api-key/api-key.service";
import { KnowledgeBaseApiKeyConfig } from "../api-key/dto/knowledge-base-api-key-config.dto";
import { InjectQueue } from "@nestjs/bullmq";
import { FileIngestJob, FileIngestJobData } from "./file-ingest.job";
import { Queue } from "bullmq";
import { IngestJobState, IngestJobStateResponseDto } from "./dto/job-state.dto";
import { randomUUID } from "crypto";
import { FileIngestDto, FileIngestResponseDto } from "./dto/ingest.dto";
import { StorageService } from "@/infra/storage/storage.service";
import { KnowledgeAssetDto } from "./dto/knowledge-asset.dto";
import { KnowledgeAssetService } from "./knowledge-asset.service";
import { filter } from "rxjs";

export type SearchOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
  filters?: Record<string, string | number | boolean>;
  topK?: number;
}

export type WithSearchOptions = (...args: any[]) => Partial<SearchOptions>;

@Injectable()
export class KnowledgeService extends Service<KnowledgeEntity> {
  logger = new Logger(KnowledgeService.name);
  entity = KnowledgeEntity;

  @InjectQueue(FileIngestJob.INGEST_KEY) private readonly ingestQueue: Queue<FileIngestJobData>;

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly vectorStore:      SourceVectorStoreService;
  @Inject() private readonly apiKeyService:    ApiKeyService;
  @Inject() private readonly storageService:   StorageService;
  @Inject() private readonly knowledgeAssetService: KnowledgeAssetService;

  private getApiKey() {
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException();
    return apiKey;
  }

  private knowledgeToApiConfig(knowledge: KnowledgeEntity | KnowledgeEntity[]): KnowledgeBaseApiKeyConfig[] {
    const toApiConfig = (kn: KnowledgeEntity): KnowledgeBaseApiKeyConfig => {
      return {
        knowledgeId: kn.id,
        permissions: KbPermission.MANAGE,
        connectorPermissions: []
      } as KnowledgeBaseApiKeyConfig;
    }
    return Array.isArray(knowledge) ? knowledge.map(toApiConfig) : [toApiConfig(knowledge)];
  }

  async ingestFile(
    { buffer, originalname, mimetype }: Express.Multer.File,
    { knowledgeId, metadata, saveFile, externalId }: FileIngestDto
  ): Promise<FileIngestResponseDto> {
    const extension = originalname.split('.').pop();
    if (!extension) throw new BadRequestException("Failed to ingest content");
    const path = `source/${knowledgeId}/${randomUUID()}.${extension}`;
    await this.storageService.putObject(path, buffer, mimetype, { temp: true });
    const job = await this.ingestQueue.add("", {
      path,
      extension,
      knowledgeId,
      metadata,
      mimetype,
      originalname,
      externalId,
      saveFile,
      size: buffer.byteLength
    }, { jobId: randomUUID() });
    if (!job.id) throw new BadRequestException("Failed to ingest content");
    return new FileIngestResponseDto(job.id);
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

  async getAssets(filterOpts: FilterOptions<KnowledgeAssetDto>): Promise<KnowledgeAssetDto[]> {
    return this.knowledgeAssetService.find(filterOpts);
  }

  //#region Override crud methods
  override create(input: CreateKnowledgeDto, manager?: EntityManager): Promise<KnowledgeEntity>;
  override create(input: CreateKnowledgeDto[], manager?: EntityManager): Promise<KnowledgeEntity[]>;
  override create(input: CreateKnowledgeDto | CreateKnowledgeDto[], manager?: EntityManager): Promise<KnowledgeEntity | KnowledgeEntity[]> {
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException();
    return this.transaction(async (manager) => {
      const entities = Array.isArray(input) ?
        input.map(i => new KnowledgeEntity({
          name: i.name,
          namespace: i.namespace
        })) :
        new KnowledgeEntity({
          name: input.name,
          namespace: input.namespace
        });
      const kns = Array.isArray(entities) ? await super.create(entities, manager) : await super.create(entities, manager);
      await this.apiKeyService.update(apiKey.id, {
        name: apiKey.name,
        knowledgeBases: this.knowledgeToApiConfig(kns),
        skipAccessValidation: true
      }, manager);
      return kns;
    }, manager);
  }
  override find(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity[]> {

    filterOptions ??= {};
    filterOptions.where ??= {};
    if (!this.getApiKey().root) filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).find(filterOptions);
  }
  override findByID(
    id: string,
    opts?: (Omit<FindOneOptions<KnowledgeEntity>, "where"> & { manager?: EntityManager; })
  ): Promise<KnowledgeEntity | null> {
    if (this.getApiKey().canAccessKnowledgeBase(id)) {
      return this.repository(opts?.manager).findOne({ where: { id }, ...opts });
    }
    throw new UnauthorizedException("You do not have permission to access this knowledge");
  }
  override findFirst(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    if (!this.getApiKey().root) filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).findOne(filterOptions);
  }
  override findUnique(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    if (!this.getApiKey().root) filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).findOne(filterOptions);
  }
  //#endregion

  //#region Ai search
  private buildFindOptions(knowledgeId: string, userInput: string, ...opts: WithSearchOptions[]): SearchOptions {
    return buildOptions({ knowledgeId, userInput }, opts);
  }

  async search(knowledgeId: string, query: string, ...options: WithSearchOptions[]): Promise<SourceVectorStorePayload[]> {
    const opts = this.buildFindOptions(knowledgeId, query, ...options);
    // get knowledge
    const knowledge = await this.findByID(knowledgeId);
    if (!knowledge) throw new NotFoundException("Knowledge not found");

    const queryEmbedding = await this.embeddingService.getOrCreateEmbedding(query);
    return this.vectorStore.search(
      knowledgeId,
      SourceVectorStoreService.withFilters({ ...opts.metadata }),
      SourceVectorStoreService.withDense({ vector: queryEmbedding.data.embeddings, topK: 100 }),
      SourceVectorStoreService.withSparse({ query: query, topK: 100 }),
      SourceVectorStoreService.withTopK(opts.topK ?? 10),
    );
  }

  static withTopK(topK: number): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, topK };
    };
  }

  static withMetadata(metadata?: Record<string, any>): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      if (!metadata) return currentOpts;
      return { ...currentOpts, metadata: { ...currentOpts.metadata, ...metadata } };
    };
  }

  static withFilters(filters?: Record<string, string | number | boolean>): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      if (!filters) return currentOpts;
      return { ...currentOpts, filters: { ...currentOpts.filters, ...filters } };
    };
  }
  //#endregion
}