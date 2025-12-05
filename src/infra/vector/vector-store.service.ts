import { env } from "@/env";
import { BaseFragment, Fragments } from "@/fragment";
import { getPresets } from "@/lib/presets";
import { LLMPreset } from "@/types/llm-preset";
import { buildOptions } from "@/utils/build-options";

import { InvalidPresetError } from "./errors/invalid-preset";
import { InvalidVectorFiltersError } from "./errors/invalid-vector-filters";

export type VectorStoreOptions = {
  llmPresetKey: string;
}
export type VectorStoreAddFragmentOptions = VectorStoreOptions & {
  forceGenerateEmbedding?: boolean;
}
export type SearchOptions = VectorStoreOptions & {
  filters?: Record<string, string | number | boolean>;
  topK: number;
  dense?: string | { topK?: number, query: string };
  sparse?: string | { topK?: number, query: string };
  term?: string;
}
export type WithSearchOptions = (currentOpts: Partial<SearchOptions>) =>  Partial<SearchOptions>;

export abstract class VectorStore<T extends BaseFragment> {

  constructor(protected readonly collectionName: string) {}

  abstract addFragments(
    fragments: T[] | T | Fragments<T>,
    opts?: VectorStoreAddFragmentOptions
  ): Promise<Fragments<T>>;
  abstract deleteFragments(fragments: T[] | T | Fragments<T>, opts?: VectorStoreOptions): Promise<void>;

  abstract search(
    knowledgeId: string,
    ...options: Array<WithSearchOptions | undefined>
  ): Promise<Fragments<T>>;

  abstract deleteByFilter(
    filter: Record<string, string | number | boolean>,
    opts?: VectorStoreOptions
  ): Promise<void>;

  protected buildCollectionName(preset: LLMPreset): string {
    if (preset.config.type === "TEXT") {
      throw new InvalidPresetError("Cannot create collection for TEXT preset");
    }

    const { dimension, model } = preset.config;
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

  protected async buildCollectionNameFromPresetKey(presetKey?: string): Promise<string> {
    if (!presetKey) presetKey = env.LLM_EMBEDDING_DEFAULT_PRESET_KEY;

    const presets = await getPresets();
    const preset = presets.find(p => p.key === presetKey);
    if (!preset) throw new InvalidPresetError(`Invalid preset key: ${presetKey}`);
    return this.buildCollectionName(preset);
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
  static withDense(dense: string | { topK?: number, query: string }): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, dense };
    };
  }
  static  withSparse(sparse: string | { topK?: number, query: string }): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, sparse };
    };
  }
  static withQuery(query: string | { topK?: number, query: string }): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, dense: query, sparse: query };
    };
  }
  static  withTerm(term: string): WithSearchOptions {
    return (currentOpts: Partial<SearchOptions>) => {
      return { ...currentOpts, term };
    };
  }

  protected buildSearchOptions(...opts: WithSearchOptions[]): SearchOptions {
    const options = buildOptions<WithSearchOptions, SearchOptions>({
      topK: 5,
      llmPresetKey: env.LLM_EMBEDDING_DEFAULT_PRESET_KEY
    }, opts);
    if (!options.dense && !options.sparse) {
      throw new InvalidVectorFiltersError("Dense or sparse query must be provided");
    }
    return options;
  }
}
