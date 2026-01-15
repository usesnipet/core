import { AssetService } from "@/infra/assets/assets.service";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AssetDomain, AssetEntity, AssetSource, AssetType } from "@/entities/asset.entity";
import { SnipetAssetDto, SnipetAssetType } from "../dto/snipet-asset.dto";
import { EntityManager } from "typeorm";
import { ASSET_POLICIES, AssetPolicy } from "./assets.policy";
import { SnipetVectorStorePayload } from "@/infra/vector/payload/snipet-vector-store-payload";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SnipetVectorStoreService } from "@/infra/vector/snipet-vector-store.service";
import { ExecutionEntity, PersistenceType } from "@/entities/execution.entity";
import { fingerprint } from "@/lib/fingerprint";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { OutputParserResult } from "../output-parser/types";
import { buildOptions } from "@/utils/build-options";

export type SnipetSearchOptions = {
  lastNMemories?: number;
  query?: string | { topK?: number, query: string };
  filters?: Record<string, string | number | boolean>;
}

export type WithSnipetSearchOptions = (currentOpts: Partial<SnipetSearchOptions>) => Partial<SnipetSearchOptions>;

type SaveAssetOptions =
  { embed: true; persistText: true; extractText: (asset: SnipetAssetDto) => string, manager?: EntityManager } |
  { embed?: false; persistText: true; extractText: (asset: SnipetAssetDto) => string, manager?: EntityManager } |
  { embed: true; persistText?: false; extractText: (asset: SnipetAssetDto) => string, manager?: EntityManager } |
  { embed?: false; persistText?: false; extractText?: never, manager?: EntityManager };

@Injectable()
export class SnipetAssetService extends AssetService<SnipetAssetDto> {
  logger = new Logger(SnipetAssetService.name);

  domain = AssetDomain.SNIPET;

  @Inject() private readonly embeddingService: EmbeddingService;
  @Inject() private readonly snipetVectorStore: SnipetVectorStoreService;

  private knowledgeAssetTypeToAssetType(type: SnipetAssetType): AssetType {
    switch (type) {
      case SnipetAssetType.ACTION:
        return AssetType.ACTION;
      case SnipetAssetType.CONTEXT:
        return AssetType.CONTEXT;
      case SnipetAssetType.AI_RESPONSE:
        return AssetType.AI_RESPONSE;
      case SnipetAssetType.USER_INPUT:
        return AssetType.USER_INPUT;
      default:
        throw new Error("Invalid asset type");
    }
  }

  private assetTypeToKnowledgeAssetType(type: AssetType): SnipetAssetType {
    switch (type) {
      case AssetType.AI_RESPONSE:
        return SnipetAssetType.AI_RESPONSE;
      case AssetType.CONTEXT:
        return SnipetAssetType.CONTEXT;
      case AssetType.ACTION:
        return SnipetAssetType.ACTION;
      case AssetType.USER_INPUT:
        return SnipetAssetType.USER_INPUT;
      default:
        throw new Error("Invalid asset type");
    }
  }

  fromEntity(entity: AssetEntity): SnipetAssetDto {
    return new SnipetAssetDto({
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
      snipetId: entity.snipetId!,
      snipet: entity.snipet,
      source: entity.source,
      executionId: entity.executionId,
      execution: entity.execution
    })
  }

  toEntity(asset: SnipetAssetDto): AssetEntity {
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
      snipetId: asset.snipetId,
      snipet: asset.snipet,
      source: asset.source
    });
  }

  //#region Save
  private save(asset: SnipetAssetDto, opts: SaveAssetOptions) {
    return this.transaction(async (manager) => {
      if (opts.persistText) {
        const text = opts.extractText(asset);
        if (!asset.content) asset.content = {};
        asset.content.text = text;
        asset.content.hash = fingerprint(text);
        asset.content.sizeBytes = Buffer.byteLength(text);
      }
      asset = await super.create(asset, manager);
      if (opts.embed) await this.embed(asset, opts.extractText);

      return asset;
    }, opts.manager);
  }
  async checkAndSaveUserInput(
    { id, knowledgeId, snipetId, options }: ExecutionEntity,
    manager?: EntityManager
  ) {
    if (options.persistenceType === PersistenceType.STATELESS) return;
    const asset = new SnipetAssetDto({
      type: SnipetAssetType.USER_INPUT,
      knowledgeId,
      snipetId,
      executionId: id,
      metadata: { },
      source: AssetSource.USER,
      createdById: this.context.apiKey?.id
    });

    return this.save(
      asset,
      { manager, persistText: true, embed: true, extractText: () => options.query }
    );
  }
  async checkAndSaveContext(
    { id, knowledgeId, snipetId }: ExecutionEntity,
    context: SnipetResolvedContext,
    manager?: EntityManager
  ) {
    const contextAsset = new SnipetAssetDto({
      type: SnipetAssetType.CONTEXT,
      knowledgeId,
      snipetId,
      executionId: id,
      metadata: {
        knowledgeMemoriesIds: context.knowledge.map((m) => m.id),
        snipetMemoriesIds: context.snipet.map((m) => m.id),
        lastNMemoriesIds: context.lastNMemories.map((m) => m.id),
      },
      source: AssetSource.SYSTEM,
      createdById: this.context.apiKey?.id
    });
    return this.save(contextAsset, { manager });
  }
  async checkAndSaveOutput(
    { id, knowledgeId, snipetId, options }: ExecutionEntity,
    output: OutputParserResult,
    manager?: EntityManager
  ) {
    const text = ASSET_POLICIES[options.intent](output);
    const asset = new SnipetAssetDto({
      type: SnipetAssetType.AI_RESPONSE,
      knowledgeId,
      snipetId,
      executionId: id,
      metadata: { raw: output },
      source: AssetSource.AI,
      createdById: this.context.apiKey?.id
    });

    return this.save(asset, {
      manager,
      embed: true,
      persistText: true,
      extractText: () => text,
    });
  }

  private async embed(
    asset: SnipetAssetDto,
    extractText: (asset: SnipetAssetDto) => string
  ): Promise<SnipetVectorStorePayload> {
    const text = extractText(asset);
    const embedding = await this.embeddingService.getOrCreateEmbedding(text);
    return await this.snipetVectorStore.add(
      new SnipetVectorStorePayload({
        dense: embedding.embeddings,
        id: asset.id,
        snipetId: asset.snipetId,
        content: text,
        fullContent: text,
        metadata: { type: "text" },
        knowledgeId: asset.knowledgeId,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        role: asset.source
      })
    );
  }
  //#endregion


  //#region Search
  async search(knowledgeId: string, snipetId: string, ...opts: WithSnipetSearchOptions[]) {
    const options = this.buildSnipetSearchOptions(...opts);
    const response: { lastNMemories: SnipetAssetDto[], query: SnipetVectorStorePayload[] } = {
      lastNMemories: [],
      query: []
    }
    if (options.lastNMemories) {
      response.lastNMemories = await this.find({
        where: { snipetId },
        order: { createdAt: "DESC" },
        take: options.lastNMemories,
        relations: ["snipet"]
      })
    }

    if (options.query) {
      const query = options.query;
      const queryEmbedding = await this.embeddingService.getOrCreateEmbedding(
        typeof query === "string" ? query : query.query
      );
      const opts = [
        SnipetVectorStoreService.withSnipetId(snipetId),
        SnipetVectorStoreService.withDense({
          vector: queryEmbedding.embeddings,
          topK: typeof query === "string" ? undefined : query.topK
        }),
      ]
      if (options.filters) opts.push(SnipetVectorStoreService.withFilters(options.filters))
      const searchQuery = await this.snipetVectorStore.search(knowledgeId, ...opts);
      response.query = searchQuery;
    }
    return response;
  }

  static withFilters(filters?: Record<string, string | number | boolean>): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      if (!filters) return currentOpts;
      return { ...currentOpts, filters: { ...currentOpts.filters, ...filters } };
    }
  }

  static withLastNMemories(lastNMessages?: number): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      if (!lastNMessages) return currentOpts;
      return { ...currentOpts, lastNMemories: lastNMessages };
    }
  }

  static withQuery(query?: string | { topK?: number, query: string }): WithSnipetSearchOptions {
    return (currentOpts: Partial<SnipetSearchOptions>) => {
      if (!query) return currentOpts;
      return { ...currentOpts, query };
    }
  }

  protected buildSnipetSearchOptions(...opts: WithSnipetSearchOptions[]) {
    return buildOptions<WithSnipetSearchOptions, SnipetSearchOptions>({}, opts);
  }
  //#endregion
}