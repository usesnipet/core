import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { SnipetEntity } from "./snipet.entity";
import { ApiKeyEntity } from "./api-key.entity";
import { Field } from "../shared/model";

export enum AssetDomain {
  SNIPET = "SNIPET",
  KNOWLEDGE = "KNOWLEDGE",
}

export enum AssetType {
  FILE = "FILE",
  TEXT = "TEXT",
  USER_QUESTION = "USER_QUESTION",
  AI_RESPONSE = "AI_RESPONSE",
  PROMPT = "PROMPT",
  CHUNK = "CHUNK",
  SEARCH_QUERY = "SEARCH_QUERY",
  SEARCH_RESULT = "SEARCH_RESULT",
  EMBEDDING = "EMBEDDING",
  TOOL_INPUT = "TOOL_INPUT",
  TOOL_OUTPUT = "TOOL_OUTPUT",
  FEEDBACK = "FEEDBACK",
}

export enum AssetSource {
  USER = "USER",
  AI = "AI",
  SYSTEM = "SYSTEM",
  INTEGRATION = "INTEGRATION",
}

export enum AssetLifecycle {
  EPHEMERAL = "EPHEMERAL",
  PERSISTENT = "PERSISTENT",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}



export class ModelInfo {

  @Field({ type: "string", nullable: true, description: "The name of the model (LLM)" })
  @Column({ nullable: true })
  name?: string;

  @Field({ type: "string", nullable: true, description: "The version of the model (LLM)" })
  @Column({ nullable: true })
  version?: string;

  @Field({ type: "number", nullable: true, description: "The cost in dollars of the model (LLM)" })
  @Column({ type: "float", nullable: true })
  cost?: number;
}

export class StorageInfo {
  @Field({ type: "string", nullable: true, description: "The provider of the storage, where the asset is stored" })
  @Column({ nullable: true })
  provider?: string;

  @Field({ type: "string", nullable: true, description: "The key of the storage, where the asset is stored" })
  @Column({ nullable: true })
  key?: string;

  @Field({ type: "boolean", description: "Indicates if the asset is persisted" })
  @Column({ default: false })
  persisted: boolean;
}

export class ContentInfo {
  @Field({ type: "string", nullable: true, description: "The text of the content" })
  @Column({ nullable: true })
  text?: string;

  @Field({ type: "string", nullable: true, description: "The hash of the content" })
  @Column({ nullable: true })
  hash?: string;

  @Field({ type: "number", nullable: true, description: "The size in bytes of the content" })
  @Column({ type: "bigint", nullable: true })
  sizeBytes?: number;

  @Field({ type: "string", nullable: true, description: "The mime type of the content" })
  @Column({ nullable: true })
  mimeType?: string;

  @Field({ type: "string", nullable: true, description: "The language of the content" })
  @Column({ nullable: true })
  language?: string;

  @Field({ type: "number", nullable: true, description: "The number of tokens estimated in the content" })
  @Column({ type: "int", nullable: true })
  tokensEstimate?: number;
}

@Entity("assets")
@Index(["domain", "type"])
export class AssetEntity extends BaseEntity {
  @Field({ type: "enum", enum: AssetDomain, description: "The domain of the asset (Knowledge or Snipet)" })
  @Column({ type: "enum", enum: AssetDomain })
  domain: AssetDomain;

  @Field({ type: "enum", enum: AssetType, description: "Indicates the type of the asset, if it is a file, text, user question, ai response..." })
  @Column({ type: "enum", enum: AssetType })
  type: AssetType;

  @Field({ type: "enum", enum: AssetSource, description: "The source of the asset (USER, AI, SYSTEM, INTEGRATION)" })
  @Column({ type: "enum", enum: AssetSource })
  source: AssetSource;

  @Field({ type: "enum", enum: AssetLifecycle, description: "The lifecycle of the asset (EPHEMERAL, PERSISTENT, ARCHIVED, DELETED)" })
  @Column({ type: "enum", enum: AssetLifecycle })
  lifecycle: AssetLifecycle;

  @Field({ type: "string", uuid: true, description: "The unique identifier for the knowledge asset" })
  @Column({ name: "knowledge_id"})
  knowledgeId: string;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, kn => kn.assets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "string", uuid: true, description: "The unique identifier for the snipet asset" })
  @Column({ name: "snipet_id",  nullable: true })
  snipetId?: string | null;
  
  @Field({ type: "class", class: () => SnipetEntity, required: false })
  @ManyToOne(() => SnipetEntity, kn => kn.assets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "snipet_id" })
  snipet?: SnipetEntity;

  @Field({ type: "string", uuid: true, description: "The unique identifier for the api key who created the asset" })
  @Column({ name: "created_by_id", nullable: true })
  createdById?: string;

  @Field({ type: "class", class: () => ApiKeyEntity, required: false })
  @ManyToOne(() => ApiKeyEntity, kn => kn.assets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "created_by_id" })
  createdBy?: ApiKeyEntity;

  @Field({ type: "class", class: () => ContentInfo, required: false })
  @Column(() => ContentInfo, { prefix: "content" })
  content?: ContentInfo;
  
  @Field({ type: "class", class: () => StorageInfo, required: false })
  @Column(() => StorageInfo, { prefix: "storage" })
  storage?: StorageInfo;

  @Field({ type: "class", class: () => ModelInfo, required: false })
  @Column(() => ModelInfo, { prefix: "model" })
  model?: ModelInfo;

  @Field({ type: "object", additionalProperties: true, required: false, description: "The metadata of the asset" })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Field({ type: "date", description: "The timestamp of the deletion" })
  @DeleteDateColumn()
  deletedAt?: Date;

  constructor(data: Partial<AssetEntity>) {
    super(data);
    Object.assign(this, data);
  }
}
