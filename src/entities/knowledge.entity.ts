import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Field } from "../shared/model";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";
import { ApiKeyAssignmentEntity } from "./api-key-assignment.entity";
import { AssetEntity } from "./asset.entity";

@Entity("knowledge_bases")
@Index("knowledge_base_namespace_unique", ["namespace"])
export class KnowledgeEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  @Field({ type: "string", min: 1, max: 255, description: "The name of the knowledge base" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "class", class: () => ConnectorEntity, isArray: true, description: "The connectors of the knowledge base" })
  @OneToMany(() => ConnectorEntity, (c) => c.knowledge)
  connectors?: ConnectorEntity[];

  @Field({ type: "class", class: () => ApiKeyAssignmentEntity, isArray: true, description: "The api key assignments of the knowledge base" })
  @OneToMany(() => ApiKeyAssignmentEntity, (r) => r.knowledge)
  apiKeyAssignments?: ApiKeyAssignmentEntity[];

  @Field({ type: "string", description: "The namespace of the knowledge base", nullable: true, required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  namespace?: string | null;

  @Field({ type: "class", class: () => AssetEntity, isArray: true, description: "The assets of the knowledge base" })
  @OneToMany(() => AssetEntity, (asset) => asset.knowledge)
  assets?: AssetEntity[];

  constructor(data: Partial<KnowledgeEntity>) {
    Object.assign(this, data);
  }
}