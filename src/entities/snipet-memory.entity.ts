import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field } from "../shared/model";
import { SnipetIntent } from "../types/snipet-intent";
import { KnowledgeEntity } from "./knowledge.entity";
import { SnipetEntity } from "./snipet.entity";

export enum MemoryType {
  USER_INPUT = "user_input",
  TEXT_ASSISTANT_OUTPUT = "text_assistant_output",
}

@Entity("snipet_memory")
export class SnipetMemoryEntity<TPayload = any> {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "snipet_id", type: "uuid" })
  snipetId: string;

  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "knowledge_id", type: "uuid" })
  knowledgeId: string;

  @Field({ type: "enum", enum: MemoryType })
  @Column({ type: "enum", enum: MemoryType })
  type: MemoryType;

  @Field({ type: "enum", enum: SnipetIntent })
  @Column({ type: "enum", enum: SnipetIntent })
  intent: SnipetIntent;

  @Field({ type: "object", additionalProperties: true })
  @Column({ type: "jsonb" })
  payload: TPayload;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => SnipetEntity, required: false })
  @ManyToOne(() => SnipetEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "snipet_id" })
  snipet?: SnipetEntity;

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
  
  constructor(partial: Partial<SnipetMemoryEntity<TPayload>>) {
    Object.assign(this, partial);
  }
}
