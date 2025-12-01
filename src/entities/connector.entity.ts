import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { Capability } from "./capability";
import { ConnectorStateEntity } from "./connector-state.entity";
import { BaseEntity } from "./entity";
import {
  IntegrationAuthType, IntegrationEntity, IntegrationType, ManualIntegrationManifest,
  MCPIntegrationManifest
} from "./integration.entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { RoleConnectorPermissionEntity } from "./role-connector-permission.entity";

export class ConnectorAuth {
  type: IntegrationAuthType;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: any;
}

@Entity("connectors")
export class ConnectorEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true, description: "The knowledge base id" })
  @Column({ type: "uuid", name: "knowledge_base_id" }) 
  knowledgeId: string;

  @Field({ type: "string", required: true, uuid: true, description: "The integration id" })
  @Column({ type: "uuid", name: "integration_id" })
  integrationId: string;
  
  @Field({ type: "string", required: true, description: "The name of the connector" })
  @Column({ type: "varchar", length: 255 })
  name: string

  @Field({ type: "enum", enum: IntegrationType, required: true, description: "The type of the connector" })
  @Column({ type: "enum", enum: IntegrationType })
  type: IntegrationType;

  @Field({ type: "enum", enum: Capability, isArray: true, required: true, description: "The capabilities of the connector" })
  @Column({ type: "jsonb" })
  capabilities: Capability[];

  @Field({ type: "class", class: () => ConnectorAuth, required: false })
  @Column({ type: "jsonb" })
  auth?: ConnectorAuth;
  
  @Field({ 
    type: 'oneOf',
    classes: [
      () => MCPIntegrationManifest,
      () => ManualIntegrationManifest
    ],
    required: true
  })
  @Column({ type: "jsonb" })
  config: MCPIntegrationManifest | ManualIntegrationManifest;

  @Field({ type: "class", class: () => IntegrationEntity, required: false })
  @ManyToOne(() => IntegrationEntity, (integration) => integration.connectors)
  @JoinColumn({ name: "integration_id" })
  integration?: IntegrationEntity;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false })
  @ManyToOne(() => KnowledgeEntity, (knowledge) => knowledge.connectors)
  @JoinColumn({ name: "knowledge_base_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => ConnectorStateEntity, required: false })
  @ManyToOne(() => ConnectorStateEntity, (connectorState) => connectorState.connector)
  connectorState?: ConnectorStateEntity;

  @Field({ type: "class", class: () => RoleConnectorPermissionEntity, isArray: true, required: false })
  @OneToMany(() => RoleConnectorPermissionEntity, (roleConnectorPermission) => roleConnectorPermission.connector)
  roleConnectorPermissions?: RoleConnectorPermissionEntity[];

  constructor(data: Partial<ConnectorEntity>) {
    super(data);
    Object.assign(this, data);
  }
}