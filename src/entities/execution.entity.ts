import { ApiExtraModels } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field } from "../shared/model";
import { SnipetIntent } from "../types/snipet-intent";
import { AssetEntity } from "./asset.entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { SnipetEntity } from "./snipet.entity";

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
    type: "boolean",
    description: "This indicates if should search in the knowledge base"
  })
  use: boolean;
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
    type: "boolean",
    description: "This indicates if should search in the snipet"
  })
  use: boolean;
}

export class ExecuteSnipetContextOptions {
  @Field({ type: "class", class: () => ExecuteSnipetContextKnowledgeOptions, nullable: true, required: false })
  knowledgeOptions?: ExecuteSnipetContextKnowledgeOptions;

  @Field({ type: "class", class: () => ExecuteSnipetContextSnipetOptions, nullable: true, required: false })
  snipetOptions?: ExecuteSnipetContextSnipetOptions;
}

export enum PersistenceType {
  STATELESS = "stateless",
  FULL = "full"
}


export class OutputOptions {
  @Field({
    type: "number",
    min: 0,
    required: false,
    description: "Maximum number of tokens to generate"
  })
  maxTokens?: number;

  @Field({
    type: "number",
    min: 0,
    max: 1,
    required: false,
    description: "Temperature for text generation (0.0 to 1.0)"
  })
  temperature: number = 0.7;
}

export class ExecuteSnipetOptions {
  @Field({ type: "class", class: () => ExecuteSnipetContextOptions, required: false })
  contextOptions?: ExecuteSnipetContextOptions;

  @Field({ type: "enum", enum: PersistenceType, required: false })
  persistenceType: PersistenceType = PersistenceType.FULL;

  @Field({ type: "class", class: () => OutputOptions, required: false })
  output?: OutputOptions;

  @Field({ type: "string", description: "The query to execute", required: true, min: 1 })
  query: string;

  @Field({ type: "enum", enum: SnipetIntent, description: "The intent of the query" })
  intent: SnipetIntent;

  @Field({ type: "boolean", required: false, description: "Enable streaming response for the output" })
  stream?: boolean;
}

export enum ExecutionState {
  PENDING = "pending",
  RUNNING = "running",
  FINISHED = "finished",
  ERROR = "error"
}

export class ExecutionResult {
  @Field({ type: "number", required: false })
  estimatedCost?: number;

  @Field({ type: "string", required: false })
  error?: string;
}

@ApiExtraModels(
  ExecuteSnipetOptions,
  ExecuteSnipetContextOptions,
  ExecuteSnipetContextKnowledgeOptions,
  ExecuteSnipetContextSnipetOptions,
  OutputOptions,
  ExecutionResult
)
@Entity("executions")
export class ExecutionEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ type: "string", uuid: true, source: "params" })
  @Column({ name: "knowledge_id", type: "uuid" })
  knowledgeId: string;

  @Field({ type: "class", class: () => KnowledgeEntity })
  @ManyToOne(() => KnowledgeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "string", uuid: true, source: "params" })
  @Column({ name: "snipet_id", type: "uuid" })
  snipetId: string;
  
  @Field({ type: "class", class: () => SnipetEntity, required: false })
  @ManyToOne(() => SnipetEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "snipet_id" })
  snipet?: SnipetEntity;

  @Field({ type: "class", class: () => ExecuteSnipetOptions })
  @Column({ type: "jsonb" })
  options: ExecuteSnipetOptions;

  @Field({ type: "class", class: () => ExecutionResult, nullable: true, required: false })
  @Column({ type: "jsonb", nullable: true })
  result?: ExecutionResult | null;

  @Field({ type: "enum", enum: ExecutionState, required: false })
  @Column({ type: "enum", enum: ExecutionState, default: ExecutionState.PENDING })
  state: ExecutionState = ExecutionState.PENDING;

  @Field({ type: "class", class: () => AssetEntity, isArray: true, required: false })
  @OneToMany(() => AssetEntity, asset => asset.execution, { onDelete: "CASCADE" })
  assets?: AssetEntity[];
  
  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
  
  constructor(data: Partial<ExecutionEntity>) {
    Object.assign(this, data);
  }
}
