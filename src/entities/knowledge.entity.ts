import { Column, Entity, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";
import { RoleAssignmentEntity } from "./role-assignment.entity";

@Entity("knowledge_bases")
export class KnowledgeEntity extends BaseEntity {
  @Field({ type: "string", description: "The name of the knowledge base" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "class", class: () => ConnectorEntity, isArray: true, description: "The connectors of the knowledge base" })
  @OneToMany(() => ConnectorEntity, (c) => c.knowledge)
  connectors?: ConnectorEntity[];

  @Field({ type: "class", class: () => RoleAssignmentEntity, isArray: true, description: "The role assignments of the knowledge base" })
  @OneToMany(() => RoleAssignmentEntity, (r) => r.knowledge)
  roleAssignments?: RoleAssignmentEntity[];

  constructor(data: Partial<KnowledgeEntity>) {
    super(data);
    Object.assign(this, data);
  }
}