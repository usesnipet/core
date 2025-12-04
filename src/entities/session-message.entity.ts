import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "../shared/model";
import { SessionEntity } from "./session.entity";
import { KnowledgeEntity } from "./knowledge.entity";

export enum SessionMessageRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
  FUNCTION = "FUNCTION"
}

@Entity("session_messages")
export class SessionMessageEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "session_id", type: "uuid" })
  sessionId: string;

  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "knowledge_id", type: "uuid" })
  knowledgeId: string;

  @Field({ type: "string", required: true })
  @Column({ type: "text" })
  content: string;

  @Field({ type: "enum", enum: SessionMessageRole, required: true })
  @Column({ type: "enum", enum: SessionMessageRole })
  role: SessionMessageRole;

  @Field({ type: "class", class: () => SessionEntity, required: false })
  @ManyToOne(() => SessionEntity, (session) => session.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  session?: SessionEntity;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  constructor(partial: Partial<SessionMessageEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}