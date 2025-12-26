import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "../shared/model";
import { SnipetMemoryEntity } from "./snipet-memory.entity";

@Entity("snipets")
@Index("snipet_name", ["name"])
export class SnipetEntity extends BaseEntity {
  @Field({ type: "string", required: false, nullable: true })
  @Column({ type: "varchar", nullable: true })
  name?: string | null;

  @Field({ type: "string", required: true })
  @Column()
  type: string;

  @Field({ type: "object", additionalProperties: true, required: false, nullable: true })
  @Column({ type: "jsonb", nullable: true })
  state?: Record<string, any>;

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

  @Field({ type: "class", class: () => SnipetMemoryEntity, isArray: true })
  @OneToMany(() => SnipetMemoryEntity, (message) => message.snipet)
  memory: SnipetMemoryEntity[];

  constructor(partial: Partial<SnipetEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}