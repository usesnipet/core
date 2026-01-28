import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Field } from "../shared/model";
import { ApiKeyConnectorPermissionEntity } from "./api-key-connector-permission.entity";
import { Capability } from "./capability";
import { ConnectorStateEntity } from "./connector-state.entity";
import {
  IntegrationAuthType, IntegrationEntity, IntegrationType, ManualIntegrationManifest,
  MCPIntegrationManifest
} from "./integration.entity";
import { KnowledgeEntity } from "./knowledge.entity";

export class ConnectorAuth {
  type: IntegrationAuthType;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: any;

  constructor(data: Partial<ConnectorAuth>) {
    Object.assign(this, data);
  }
}

@Entity("connectors")
export class ConnectorEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Field({ type: "string", required: true, uuid: true, description: "The knowledge base id" })
  @Column({ type: "uuid", name: "knowledge_base_id" })
  knowledgeId: string;

  @Field({ type: "string", required: true, uuid: true, description: "The integration id" })
  @Column({ type: "uuid", name: "integration_id" })
  integrationId: string;

  @Field({ type: "string", required: true, description: "The name of the connector", max: 255 })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "enum", enum: IntegrationType, required: true, description: "The type of the connector" })
  @Column({ type: "enum", enum: IntegrationType })
  type: IntegrationType;

  @Field({ type: "enum", enum: Capability, isArray: true, required: true, description: "The capabilities of the connector" })
  @Column({ type: "jsonb" })
  capabilities: Capability[];

  @Field({ type: "class", class: () => ConnectorAuth, required: false, hidden: true })
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

  @Field({ type: "class", class: () => ApiKeyConnectorPermissionEntity, isArray: true, required: false })
  @OneToMany(() => ApiKeyConnectorPermissionEntity, (apiKeyConnectorPermission) => apiKeyConnectorPermission.connector)
  apiKeyConnectorPermissions?: ApiKeyConnectorPermissionEntity[];
  

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  constructor(data: Partial<ConnectorEntity>) {
    Object.assign(this, data);
  }
}