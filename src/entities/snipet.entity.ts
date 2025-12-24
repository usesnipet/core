import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "../shared/model";
import { SnipetMessageEntity } from "./snipet-message.entity";

export enum SnipetType {
  CHAT = "CHAT",
}

@Entity("snipets")
@Index("snipet_name", ["name"])
export class SnipetEntity extends BaseEntity {
  @Field({ type: "string", required: false, nullable: true })
  @Column({ type: "varchar", nullable: true })
  name?: string | null;

  @Field({ type: "enum", enum: SnipetType, required: true })
  @Column({ type: "enum", enum: SnipetType, default: SnipetType.CHAT })
  type: SnipetType;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false,
    nullable: true
  })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null;

  @Field({ type: "string", uuid: true, required: true })
  @Column({ type: "uuid", name: "knowledge_id" })
  knowledgeId: string;

  @Field({ type: "class", class: () => SnipetMessageEntity, isArray: true })
  @OneToMany(() => SnipetMessageEntity, (message) => message.snipet)
  chatMessages: SnipetMessageEntity[];

  constructor(partial: Partial<SnipetEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}