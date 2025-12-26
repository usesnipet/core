/* eslint-disable camelcase */
import { env } from "@/env";
import { BaseFragment, Fragments } from "@/fragment";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { getPresets } from "@/lib/presets";
import { Constructor } from "@/types/constructor";
import { LLMPreset } from "@/types/llm-preset";
import { Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  CreateIndexesReq, FieldType, FunctionObject, HybridSearchSingleReq, MilvusClient, RerankerObj, RowData,
  RRFRanker
} from "@zilliz/milvus2-sdk-node";

import { VectorDeleteError } from "../errors/delete-error";
import { InvalidVectorFiltersError } from "../errors/invalid-vector-filters";
import { VectorMutationError } from "../errors/vector-mutation";
import { VectorSearchError } from "../errors/vector-search";
import {
  VectorStore, VectorStoreAddOptions, VectorStoreOptions, WithSearchOptions
} from "../vector-store.service";
import { VectorStorePayload } from "../payload/vector-store-payload";

export abstract class MilvusService<T extends VectorStorePayload>
  extends VectorStore<T> implements OnModuleInit, OnModuleDestroy {

  protected abstract readonly logger: Logger;
  client: MilvusClient;

  constructor(
    protected readonly llmManager: LLMManagerService,
    protected readonly collectionName: string,
    protected readonly Type: Constructor<T>,
    protected readonly fields: FieldType[] | ((model: string, dim: number) => FieldType[]) = [],
    protected readonly functions: FunctionObject[] | (() => FunctionObject[]) = [],
    protected readonly indexSchema: CreateIndexesReq | ((collectionName: string) => CreateIndexesReq) = [],
    protected readonly reranker: RerankerObj = RRFRanker(100)
  ) {
    super(collectionName);
    this.client = new MilvusClient({ address: env.MILVUS_URL });
  }

  private async setupCollection(preset: LLMPreset): Promise<void> {
    try {
      if (preset.config.type === "TEXT") return;
      const { dimension, model } = preset.config;
      if (typeof model !== "string" || typeof dimension !== "number") {
        this.logger.warn("Invalid model name or dimension:", model, dimension);
        return;
      }

      const collectionName = this.buildCollectionName(preset);

      const existsCollection = (await this.client.hasCollection({ collection_name: collectionName })).value;

      if (!env.MILVUS_RECREATE_COLLECTION && existsCollection) return;
      if (env.MILVUS_RECREATE_COLLECTION && existsCollection) {
        this.logger.warn("Env var MILVUS_RECREATE_COLLECTION is true, dropping collection");
        await this.client.dropCollection({ collection_name: collectionName });
      }

      await this.client.createCollection({
        collection_name: collectionName,
        fields: this.fields instanceof Function ? this.fields(model, dimension) : this.fields,
        functions: this.functions instanceof Function ? this.functions() : this.functions
      });

      await this.client.createIndex(
        this.indexSchema instanceof Function ? this.indexSchema(collectionName) : this.indexSchema
      );
      await this.client.loadCollectionAsync({ collection_name: collectionName });
    } catch (error) {
      this.logger.error("Failed to setup collection:", error);
    }
  }

  async onModuleInit(): Promise<void> {
    await this.client.connectPromise;
    for (const preset of (await getPresets())) {
      await this.setupCollection(preset);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.closeConnection();
  }

  abstract payloadToChunk(data: T): RowData;
  abstract payloadToChunk(data: T[]): RowData[];

  abstract chunkToPayload(data: RowData[]): T[];
  abstract chunkToPayload(data: RowData): T;

  async add(c: T[], opts?: VectorStoreAddOptions): Promise<T[]>
  async add(c: T, opts?: VectorStoreAddOptions): Promise<T>
  async add(c: T[] | T, opts?: VectorStoreAddOptions): Promise<T | T[]> {
    const collection_name = await this.buildCollectionNameFromPresetKey(opts?.llmPresetKey);

    const res = await this.client.insert({
      collection_name,
      fields_data: Array.isArray(c) ? this.payloadToChunk(c) : [this.payloadToChunk(c)]
    });

    if (res.err_index.length > 0) throw new VectorMutationError("Error adding fragments" + collection_name, res);
    return c;
  }

  async remove(ids: string | string[], opts?: VectorStoreOptions): Promise<void> {
    ids = Array.isArray(ids) ? ids : [ids];
    if (!ids.length) return;

    const res = await this.client.delete({
      collection_name: await this.buildCollectionNameFromPresetKey(opts?.llmPresetKey),
      filter: `id in [${ids.map(id => `"${id}"`).join(", ")}]`
    });
    if (res.err_index.length > 0) throw new VectorMutationError("Error deleting fragments", res);
  }

  async search(knowledgeId: string, ...opts: WithSearchOptions[]): Promise<T[]> {
    const options = this.buildSearchOptions(...opts);
    if (!options.filters) options.filters = {};
    options.filters.knowledgeId = knowledgeId;
    const collectionName = await this.buildCollectionNameFromPresetKey(options.llmPresetKey);
    const embeddingProvider = await this.llmManager.getEmbeddingProvider();
    if (!embeddingProvider) {
      this.logger.error("No embedding provider found");
      throw new VectorMutationError("No embedding provider found");
    }

    const escapeFilterValue = (value: string): string => value.replace(/['"]/g, "\\$&");
    let filter = this.buildFilters(options.filters);
    if (options.term) {
      if (typeof options.term !== "string" || options.term.length > 500) {
        throw new InvalidVectorFiltersError("Invalid search term");
      }

      const term = escapeFilterValue(options.term.trim());
      const textMatch = `TEXT_MATCH(fullContent, '${term}')`;

      filter = filter ? `${filter} && ${textMatch}` : textMatch;
    }
    //#region search
    const data: HybridSearchSingleReq[] = [];
    if (options.dense) {
      let topK = options.topK;
      if (!Array.isArray(options.dense) && options.dense.topK) topK = options.dense.topK;
      const embeddings = Array.isArray(options.dense) ? options.dense : options.dense.vector;
      data.push({
        anns_field: "dense",
        data: embeddings,
        limit: topK,
        param: { nprobe: 10 }
      } as HybridSearchSingleReq);
    }
    if (options.sparse) {
      let topK = options.topK;
      if (typeof options.sparse !== "string" && options.sparse.topK) topK = options.sparse.topK;
      data.push({
        anns_field: "sparse",
        data: typeof options.sparse === "string" ? options.sparse : options.sparse.query,
        limit: topK,
        param: { drop_ratio_search: 0.2 }
      } as HybridSearchSingleReq);
    }
    //#endregion

    if (data.length === 0) throw new InvalidVectorFiltersError("No search data");
    const result = await this.client.search({
      collection_name: collectionName,
      filter,
      data: data,
      topk: options.topK,
      rerank: options.dense && options.sparse ? this.reranker : undefined
    });
    if (!result.results?.length) return [];
    if (result.status.error_code !== "Success") throw new VectorSearchError("Error searching fragments");

    return this.chunkToPayload(result.results);
  }

  async deleteByFilter(
    filter: Record<string, string | number | boolean>,
    opts?: VectorStoreOptions
  ): Promise<void> {
    const collectionName = await this.buildCollectionNameFromPresetKey(opts?.llmPresetKey);

    const res = await this.client.delete({
      collection_name: collectionName,
      filter: this.buildFilters(filter)
    });
    if (res.err_index.length > 0) {
      this.logger.error("Error deleting fragments", res);
      throw new VectorDeleteError("Error deleting fragments");
    }
  }

  private buildFilters(filters?: Record<string, string | number | boolean>): string {
    const exprParts: string[] = [];
    Object.entries(filters ?? {}).map(([ key, value ]) => {
      switch (typeof value) {
        case "string":
          exprParts.push(`${key} == "${String(value).replace(/"/g, "\\\"")}"`);
          break;
        case "number":
        case "boolean":
          exprParts.push(`${key} == ${value}`);
          break;
        default:
          break;
      }
    });

    return exprParts.join(" && ");
  }
}

