import { AssetService } from "@/infra/assets/assets.service";
import { Inject, Logger } from "@nestjs/common";
import { AssetEntity, AssetSource, AssetType } from "@/entities/asset.entity";
import { SnipetAssetDto, SnipetAssetType } from "../dto/snipet-asset.dto";
import { EntityManager } from "typeorm";
import { ASSET_POLICIES, AssetPolicy } from "./assets.policy";
import { SnipetVectorStorePayload } from "@/infra/vector/payload/snipet-vector-store-payload";
import { EmbeddingService } from "@/infra/embedding/embedding.service";
import { SnipetVectorStoreService } from "@/infra/vector/snipet-vector-store.service";
import { ExecutionEntity, PersistenceType } from "@/entities/execution.entity";
import { fingerprint } from "@/lib/fingerprint";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { OutputParserResult } from "../output-parser/output-parser.types";

export class SnipetAssetService extends AssetService<SnipetAssetDto> {
  logger = new Logger(SnipetAssetService.name);

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
      case SnipetAssetType.USER_QUESTION:
        return AssetType.USER_QUESTION;
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
      case AssetType.USER_QUESTION:
        return SnipetAssetType.USER_QUESTION;
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
      snipet: entity.snipet
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

  private save(asset: SnipetAssetDto, manager?: EntityManager) {
    return this.transaction(async (manager) => {
      const policy = ASSET_POLICIES[asset.type];
      if (policy.persistText) {
        const text = policy.extractText(asset.metadata?.payload);
        if (!asset.content) asset.content = {};
        asset.content.text = text;
      }
      const created = await super.create(asset, manager);
      if (policy.embed) {
        await this.embed(created, policy);
      }
      return created;
    }, manager);
  }

  async checkAndSaveUserInput(
    { id, knowledgeId, snipetId, options }: ExecutionEntity,
    manager?: EntityManager
  ) {
    if (options.persistenceType === PersistenceType.STATELESS) return;
    const asset = new SnipetAssetDto({
      type: SnipetAssetType.USER_QUESTION,
      knowledgeId,
      snipetId,
      executionId: id,
      content: {
        hash: fingerprint(options.query),
        text: options.query,
        sizeBytes: Buffer.byteLength(options.query),
      },
      metadata: {
        intent: options.intent,
        query: options.query
      },
      source: AssetSource.USER,
    });
    return this.save(asset, manager);
  }

  async checkAndSaveContext(
    { id, knowledgeId, snipetId, options }: ExecutionEntity,
    context: SnipetResolvedContext,
    manager?: EntityManager
  ) {
    const contextAsset = new SnipetAssetDto({
      type: SnipetAssetType.CONTEXT,
      knowledgeId,
      snipetId,
      executionId: id,
      content: {
        hash: fingerprint(options.query),
        text: options.query,
        sizeBytes: Buffer.byteLength(options.query),
      },
      metadata: {
        knowledgeMemoriesIds: context.knowledge.map((m) => m.id),
        snipetMemoriesIds: context.snipet.map((m) => m.id),
        lastNMemoriesIds: context.lastNMemories.map((m) => m.id),
      },
      source: AssetSource.SYSTEM,
    })
    return this.save(contextAsset, manager);
  }

  async checkAndSaveOutput(
    { id, knowledgeId, snipetId, options }: ExecutionEntity,
    output: OutputParserResult,
    manager?: EntityManager
  ) {
    const policy = ASSET_POLICIES[options.intent];
    const text = policy.extractText(output);
    const asset = new SnipetAssetDto({
      type: SnipetAssetType.AI_RESPONSE,
      knowledgeId,
      snipetId,
      executionId: id,
      content: {
        text,
        hash: fingerprint(text),
        sizeBytes: Buffer.byteLength(options.query),
      },
      metadata: { raw: output },
      source: AssetSource.AI,
    });
    return this.save(asset, manager);
  }

  private async embed(asset: SnipetAssetDto, policy: AssetPolicy): Promise<SnipetVectorStorePayload> {
    const text = policy.extractText(asset.metadata?.payload);
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
}