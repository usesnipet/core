import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field } from "../shared/model";
import { AssetEntity } from "./asset.entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { SnipetMemoryEntity } from "./snipet-memory.entity";

@Entity("snipets")
@Index("snipet_name", ["name"])
export class SnipetEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Field({ type: "string", required: false, nullable: true })
  @Column({ type: "varchar", nullable: true })
  name?: string | null;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false,
    nullable: true,
    description: "Metadata of the snipet",
  })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null = null;

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

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  constructor(partial: Partial<SnipetEntity>) {
    Object.assign(this, partial);
  }
}