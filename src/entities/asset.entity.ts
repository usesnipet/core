import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field } from "../shared/model";
import { ApiKeyEntity } from "./api-key.entity";
import { ExecutionEntity } from "./execution.entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { SnipetEntity } from "./snipet.entity";

export enum AssetDomain {
  SNIPET = "SNIPET",
  KNOWLEDGE = "KNOWLEDGE",
}

export enum AssetType {
  FILE = "FILE",
  TEXT = "TEXT",
  USER_INPUT = "USER_INPUT",
  AI_RESPONSE = "AI_RESPONSE",
  CONTEXT = "CONTEXT",
  ACTION = "ACTION",
}

export enum AssetSource {
  USER = "USER",
  AI = "AI",
  SYSTEM = "SYSTEM",
  INTEGRATION = "INTEGRATION",
}

export class ModelInfo {
  @Field({ type: "string", nullable: true, description: "The name of the model (LLM)" })
  @Column({ nullable: true })
  name?: string;

  @Field({ type: "string", nullable: true, description: "The version of the model (LLM)" })
  @Column({ nullable: true })
  version?: string;
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
}

@Entity("assets")
@Index(["domain", "type"])
export class AssetEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ type: "enum", enum: AssetDomain, description: "The domain of the asset (Knowledge or Snipet)" })
  @Column({ type: "enum", enum: AssetDomain })
  domain: AssetDomain;

  @Field({ type: "enum", enum: AssetType, description: "Indicates the type of the asset, if it is a file, text, user question, ai response..." })
  @Column({ type: "enum", enum: AssetType })
  type: AssetType;

  @Field({ type: "enum", enum: AssetSource, description: "The source of the asset (USER, AI, SYSTEM, INTEGRATION)" })
  @Column({ type: "enum", enum: AssetSource })
  source: AssetSource;

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
  
  @Field({ type: "string", uuid: true, description: "The unique identifier for the execution asset" })
  @Column({ name: "execution_id",  nullable: true })
  executionId?: string | null;
  
  @Field({ type: "class", class: () => ExecutionEntity, required: false })
  @ManyToOne(() => ExecutionEntity, kn => kn.assets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "execution_id" })
  execution?: ExecutionEntity;
  
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
  
  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  constructor(data: Partial<AssetEntity>) {
    Object.assign(this, data);
  }
}
