import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Field } from "../shared/model";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";
import { ManualIntegrationManifest, MCPIntegrationManifest } from "./integration.entity";
import { RoleAssignmentEntity } from "./role-assignment.entity";

export enum PolicyMode {
  ALLOWLIST = 'ALLOWLIST',
  DENYLIST = 'DENYLIST'
}

@Entity("role_connector_permissions")
export class RoleConnectorPermissionEntity extends BaseEntity {
  @Field({ type: "string", uuid: true, description: "The id of role connector permission" })
  @Column({ type: "uuid", name: "connector_id" })
  connectorId: string;

  @Field({ type: "string", uuid: true, description: "The id of role connector permission" })
  @Column({ type: "uuid", name: "role_assignment_id" })
  roleAssignmentId: string;
  
  @Field({ type: "enum", enum: PolicyMode, description: "The policy mode of role connector permission" })
  @Column({ type: "enum", enum: PolicyMode })
  policyMode: PolicyMode;

  @Field({ type: "string", isArray: true, nullable: true, description: "The tools of role connector permission" })
  @Column({ type: "jsonb", nullable: true })
  tools?: string[];  

  @Field({ type: "string", isArray: true, nullable: true, description: "The resources of role connector permission" })
  @Column({ type: "jsonb", nullable: true })
  resources?: string[];

  @Field({ type: "string", isArray: true, nullable: true, description: "The webhook events of role connector permission" })
  @Column({ type: "jsonb", nullable: true })
  webhookEvents?: string[];

  @Field({ 
    type: "oneOf",
    classes: [
      () => MCPIntegrationManifest,
      () => ManualIntegrationManifest
    ],
    description: "The manifest of role connector permission",
    nullable: true
  })
  @Column({ type: "jsonb", nullable: true })
  manifestSnapshot?: MCPIntegrationManifest | ManualIntegrationManifest;

  @Field({ type: "string", nullable: true, description: "The manifest version of role connector permission" })
  @Column({ type: "varchar", nullable: true })
  manifestVersion?: string;

  @Field({ type: "class", class: () => RoleAssignmentEntity, required: false, description: "The role assignment of role connector permission" })
  @ManyToOne(() => RoleAssignmentEntity, (roleAssignment) => roleAssignment.connectorPermissions, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "role_assignment_id" })
  roleAssignment?: RoleAssignmentEntity;

  @Field({ type: "class", class: () => ConnectorEntity, required: false, description: "The connector of role connector permission" })
  @ManyToOne(() => ConnectorEntity, (connector) => connector.roleConnectorPermissions, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "connector_id" })
  connector?: ConnectorEntity;

  constructor(data: Partial<RoleConnectorPermissionEntity>) {
    super(data);
    Object.assign(this, data);
  }
}