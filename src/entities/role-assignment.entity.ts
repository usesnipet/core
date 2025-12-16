import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { BaseEntity } from "./entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { RoleConnectorPermissionEntity } from "./role-connector-permission.entity";
import { RoleEntity } from "./role.entity";

export enum KbPermission {
  READ = 1 << 0,
  WRITE = 1 << 1,
  MANAGE = 1 << 2
}

@Entity("role_assignments")
export class RoleAssignmentEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true, description: "The id of the role" })
  @Column({ type: "uuid", name: "role_id" })
  roleId: string;

  @Field({ type: "enum", enum: KbPermission, required: true, description: "The permissions of the role" })
  @Column({ type: "enum", enum: KbPermission, name: "kb_permissions" })
  kbPermissions: KbPermission;

  @Field({ type: "string", required: true, uuid: true, description: "The id of the knowledge base" })
  @Column({ type: "uuid", name: "knowledge_base_id" })
  knowledgeId: string;

  @Field({ type: "class", class: () => RoleEntity, required: false, description: "The role of the role assignment" })
  @ManyToOne(() => RoleEntity, (role) => role.roleAssignments, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role?: RoleEntity;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false, description: "The knowledge base of the role assignment" })
  @ManyToOne(() => KnowledgeEntity, (kb) => kb.roleAssignments, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_base_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => RoleConnectorPermissionEntity, isArray: true, required: false, description: "The connector permissions of the role assignment" })
  @OneToMany(() => RoleConnectorPermissionEntity, (c) => c.roleAssignment, { cascade: [ "insert", "update" ], eager: true })
  connectorPermissions?: RoleConnectorPermissionEntity[];

  constructor(data: Partial<RoleAssignmentEntity>) {
    super(data);
    Object.assign(this, data);
  }
}
