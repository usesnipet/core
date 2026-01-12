import { Field } from "@/shared/model";
import { SnipetIntent } from "@/types/snipet-intent";
import { ApiExtraModels } from "@nestjs/swagger";

export enum SearchType {
  DENSE = "dense",
  SPARSE = "sparse",
}

export class ExecuteSnipetContextKnowledgeOptions {
  @Field({ type: "number", required: false })
  topK?: number;

  @Field({
    type: "enum",
    enum: SearchType,
    isArray: true
  })
  searchTypes?: Array<SearchType>;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false
  })
  filters?: Record<string, number | boolean | string>;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false
  })
  metadata?: Record<string, any>;

  @Field({
    type: "enum",
    enum: ["force", "ignore", "auto"],
    description: "force/ignore/auto policy for knowledge, this indicates if should filter the knowledge"
  })
  use: "force" | "ignore" | "auto";
}

export class ExecuteSnipetContextSnipetOptions {
  @Field({ type: "number", required: false })
  topK?: number;

  @Field({
    type: "enum",
    enum: SearchType,
    isArray: true
  })
  searchTypes?: Set<SearchType>;

  @Field({ type: "number", required: false })
  lastNMemories?: number;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false
  })
  filters?: Record<string, number | boolean | string>;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false
  })
  metadata?: Record<string, any>;

  @Field({
    type: "enum",
    enum: ["force", "ignore", "auto"],
    description: "force/ignore/auto policy for snipet memory, this indicates if should filter the memories"
  })
  use: "force" | "ignore" | "auto";
}

export class ExecuteSnipetContextOptions {
  @Field({ type: "class", class: () => ExecuteSnipetContextKnowledgeOptions, nullable: true, required: false })
  knowledgeOptions?: ExecuteSnipetContextKnowledgeOptions;

  @Field({ type: "class", class: () => ExecuteSnipetContextSnipetOptions, nullable: true, required: false })
  snipetOptions?: ExecuteSnipetContextSnipetOptions;
}

export enum MemoryMode {
  STATELESS = "stateless",
  CONVERSATION = "conversation"
}

export class MemoryOptions {
  @Field({ type: "enum", enum: MemoryMode, default: MemoryMode.STATELESS })
  mode: MemoryMode;
}

export class OutputOptions {
  @Field({ type: "number", min: 0, required: false, description: "Maximum number of tokens to generate" })
  maxTokens?: number;

  @Field({ type: "number", min: 0, max: 1, default: 0.7, required: false, description: "Temperature for text generation (0.0 to 1.0)"})
  temperature?: number;
}

export class ExecuteSnipetOptions {
  @Field({ type: "class", class: () => ExecuteSnipetContextOptions, nullable: true, required: false })
  contextOptions?: ExecuteSnipetContextOptions;


  @Field({ type: "class", class: () => MemoryOptions, nullable: true, required: false })
  memory?: MemoryOptions;

  @Field({ type: "class", class: () => OutputOptions, nullable: true, required: false })
  output?: OutputOptions;
}

@ApiExtraModels(
  ExecuteSnipetOptions,
  ExecuteSnipetContextOptions,
  ExecuteSnipetContextKnowledgeOptions,
  ExecuteSnipetContextSnipetOptions,
  MemoryOptions,
  OutputOptions
)
export class ExecuteSnipetDto {
  @Field({ type: "string", uuid: true, source: "params" })
  knowledgeId: string;

  @Field({ type: "string", uuid: true, source: "params" })
  snipetId: string;

  @Field({ type: "string", description: "The query to execute", required: true, min: 1 })
  query: string;

  @Field({ type: "enum", enum: SnipetIntent, description: "The intent of the query" })
  intent: SnipetIntent;

  @Field({ type: "boolean", required: false, description: "Enable streaming response for the output" })
  stream?: boolean;
  
  @Field({ type: "class", class: () => ExecuteSnipetOptions, nullable: true, required: false })
  options?: ExecuteSnipetOptions | null;
}

export class ExecuteSnipetResponseDto {
  @Field({ type: "string", uuid: true, description: "Execution identifier for tracking the snipet execution" })
  executionId: string;

  constructor(executionId: string) {
    this.executionId = executionId;
  }
}