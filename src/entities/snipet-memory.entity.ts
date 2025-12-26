import { Field } from "@/shared/model";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { SnipetEntity } from "./snipet.entity";

@Entity("snipet_memory")
export class SnipetMemoryEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "snipet_id", type: "uuid" })
  snipetId: string;

  @Field({ type: "string", required: true, uuid: true })
  @Column({ name: "knowledge_id", type: "uuid" })
  knowledgeId: string;

  @Field({ type: "string", required: true })
  @Column()
  type: string; // user | system | tool | model | custom

  @Field({ type: "object", additionalProperties: true })
  @Column({ type: "jsonb" })
  payload: { text: string, } & any;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => SnipetEntity, required: false })
  @ManyToOne(() => SnipetEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "snipet_id" })
  snipet?: SnipetEntity;

  constructor(partial: Partial<SnipetMemoryEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
