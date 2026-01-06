import { Column, Entity, Index, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";
import { ApiKeyAssignmentEntity } from "./api-key-assignment.entity";

@Entity("knowledge_bases")
@Index("knowledge_base_namespace_unique", ["namespace"])
export class KnowledgeEntity extends BaseEntity {
  @Field({ type: "string", min: 10, description: "The name of the knowledge base", required: true })
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

  constructor(data: Partial<KnowledgeEntity>) {
    super(data);
    Object.assign(this, data);
  }
}