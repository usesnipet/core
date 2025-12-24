import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "../shared/model";
import { SnipetEntity } from "./snipet.entity";
import { KnowledgeEntity } from "./knowledge.entity";

export enum SnipetMessageRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
  FUNCTION = "FUNCTION"
}

@Entity("snipet_messages")
export class SnipetMessageEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "snipet_id", type: "uuid" })
  snipetId: string;

  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "knowledge_id", type: "uuid" })
  knowledgeId: string;

  @Field({ type: "string", required: true })
  @Column({ type: "text" })
  content: string;

  @Field({ type: "enum", enum: SnipetMessageRole, required: true })
  @Column({ type: "enum", enum: SnipetMessageRole })
  role: SnipetMessageRole;

  @Field({ type: "class", class: () => SnipetEntity, required: false })
  @ManyToOne(() => SnipetEntity, (snipet) => snipet.chatMessages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "snipet_id" })
  snipet?: SnipetEntity;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  constructor(partial: Partial<SnipetMessageEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}