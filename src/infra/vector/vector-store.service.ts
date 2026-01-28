import { env } from "@/env";
import { buildOptions } from "@/utils/build-options";

import { InvalidPresetError } from "./errors/invalid-preset";
import { InvalidVectorFiltersError } from "./errors/invalid-vector-filters";
import { VectorStorePayload } from "./payload/vector-store-payload";
import { BaseEmbeddingLLMConfig } from "@/types";

export type SearchOptions = {
  filters?: Record<string, string | number | boolean>;
  topK: number;
  dense?: number[] | { topK?: number, vector: number[] };
  sparse?: string | { topK?: number, query: string };
  term?: string;
}
export type WithSearchOptions = (currentOpts: Partial<SearchOptions>) =>  Partial<SearchOptions>;

export abstract class VectorStore<T extends VectorStorePayload> {

  constructor(protected readonly collectionName: string) {}

  abstract add(data: T): Promise<T>;
  abstract add(data: T[]): Promise<T[]>;

  abstract remove(ids: string | string[]): Promise<void>;
  abstract removeBy(field: string, value: any): Promise<void>
  abstract search(knowledgeId: string, ...options: Array<WithSearchOptions>): Promise<T[]>;

  abstract deleteByFilter(filter: Record<string, string | number | boolean>): Promise<void>;

  protected buildCollectionName(config?: BaseEmbeddingLLMConfig): string {
    if (!config) config = {
      model: env.LLM_EMBEDDING_DEFAULT_MODEL,
      dimension: env.LLM_EMBEDDING_DEFAULT_DIMENSION,
      opts: env.LLM_EMBEDDING_DEFAULT_OPTIONS
    } as BaseEmbeddingLLMConfig;
    const { dimension, model } = config;
    let name = `${this.collectionName}_${model}_${dimension}`.toLowerCase().trim();

    // replace special characters to "_"
    name = name.replace(/[^a-z0-9_]+/g, "_");

    // remove consecutive "_"
    name = name.replace(/_+/g, "_").replace(/^_+|_+$/g, "");

    // add "c_" if the name starts with a number
    if (/^[0-9]/.test(name)) {
      name = "c_" + name;
    }

    return name;
  }

  static withFilters(filters: Record<string, string | number | boolean>): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, filters: { ...currentOpts.filters, ...filters } };
    };
  }
  static withTopK(topK: number): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, topK };
    };
  }
  static withDense(dense: number[] | { topK?: number, vector: number[] }): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, dense };
    };
  }
  static withSparse(sparse: string | { topK?: number, query: string }): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, sparse };
    };
  }

  static withTerm(term: string): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, term };
    };
  }

  protected buildSearchOptions(...opts: WithSearchOptions[]): SearchOptions {
    const options = buildOptions<WithSearchOptions, SearchOptions>({ topK: 5 }, opts);
    if (!options.dense && !options.sparse) {
      throw new InvalidVectorFiltersError("Dense or sparse query must be provided");
    }
    return options;
  }
}
