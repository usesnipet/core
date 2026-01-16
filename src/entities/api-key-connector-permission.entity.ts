import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Field } from "../shared/model";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";
import { ManualIntegrationManifest, MCPIntegrationManifest } from "./integration.entity";
import { ApiKeyAssignmentEntity } from "./api-key-assignment.entity";

export enum PolicyMode {
  ALLOWLIST = 'ALLOWLIST',
  DENYLIST = 'DENYLIST'
}

@Entity("api_key_connector_permissions")
export class ApiKeyConnectorPermissionEntity extends BaseEntity {
  @Field({ type: "string", uuid: true, description: "The id of api key connector permission" })
  @Column({ type: "uuid", name: "connector_id" })
  connectorId: string;

  @Field({ type: "string", uuid: true, description: "The id of api key connector permission" })
  @Column({ type: "uuid", name: "api_key_assignment_id" })
  apiKeyAssignmentId: string;
  
  @Field({ type: "enum", enum: PolicyMode, description: "The policy mode of api key connector permission" })
  @Column({ type: "enum", enum: PolicyMode })
  policyMode: PolicyMode;

  @Field({ type: "string", isArray: true, nullable: true, description: "The tools of api key connector permission" })
  @Column({ type: "jsonb", nullable: true })
  tools?: string[];  

  @Field({ type: "string", isArray: true, nullable: true, description: "The resources of api key connector permission" })
  @Column({ type: "jsonb", nullable: true })
  resources?: string[];

  @Field({ type: "string", isArray: true, nullable: true, description: "The webhook events of api key connector permission" })
  @Column({ type: "jsonb", nullable: true })
  webhookEvents?: string[];

  @Field({ 
    type: "oneOf",
    classes: [
      () => MCPIntegrationManifest,
      () => ManualIntegrationManifest
    ],
    description: "The manifest of api key connector permission",
    nullable: true
  })
  @Column({ type: "jsonb", nullable: true })
  manifestSnapshot?: MCPIntegrationManifest | ManualIntegrationManifest;

  @Field({ type: "string", nullable: true, description: "The manifest version of api key connector permission" })
  @Column({ type: "varchar", nullable: true })
  manifestVersion?: string;

  @Field({ type: "class", class: () => ApiKeyAssignmentEntity, required: false, description: "The api key assignment of api key connector permission" })
  @ManyToOne(() => ApiKeyAssignmentEntity, (apiKeyAssignment) => apiKeyAssignment.connectorPermissions, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "api_key_assignment_id" })
  apiKeyAssignment?: ApiKeyAssignmentEntity;

  @Field({ type: "class", class: () => ConnectorEntity, required: false, description: "The connector of api key connector permission" })
  @ManyToOne(() => ConnectorEntity, (connector) => connector.apiKeyConnectorPermissions, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "connector_id" })
  connector?: ConnectorEntity;

  constructor(data: Partial<ApiKeyConnectorPermissionEntity>) {
    super(data);
    Object.assign(this, data);
  }
}