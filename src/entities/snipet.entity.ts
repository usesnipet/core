import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "../shared/model";
import { SnipetMemoryEntity } from "./snipet-memory.entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { AssetEntity } from "./asset.entity";

@Entity("snipets")
@Index("snipet_name", ["name"])
export class SnipetEntity extends BaseEntity {
  @Field({ type: "string", required: false, nullable: true })
  @Column({ type: "varchar", nullable: true })
  name?: string | null;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false,
    nullable: true,
    description: "Metadata of the snipet",
    default: null
  })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null;

  @Field({ type: "string", uuid: true, required: true })
  @Column({ type: "uuid", name: "knowledge_id" })
  knowledgeId: string;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => AssetEntity, isArray: true })
  @OneToMany(() => AssetEntity, (asset) => asset.snipet)
  assets?: AssetEntity[];

  @Field({ type: "class", class: () => SnipetMemoryEntity, isArray: true })
  @OneToMany(() => SnipetMemoryEntity, (message) => message.snipet)
  memory: SnipetMemoryEntity[];

  constructor(partial: Partial<SnipetEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}