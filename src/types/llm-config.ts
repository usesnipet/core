export type BaseTextLLMConfig<TOpts = {}> = {
  model: string;
  opts: TOpts;
};

export type BaseEmbeddingLLMConfig<TOpts = {}> = {
  model: string;
  dimension: number;
  opts: TOpts;
};