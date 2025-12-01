import { Column, Entity, OneToMany } from "typeorm";

import { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

import { Field } from "../shared/model";
import { Capability } from "./capability";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";

export class MCPTool {
  key: string;
  title: string;
  description?: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  annotations: ToolAnnotations;
}

export class MCPResource {
  key: string;
  title: string;
  description?: string;
  schema: Record<string, any>; 
}

export class MCPIntegrationManifest {
  version: string;
  baseUrl: string;
  capabilities: Capability[];  
  tools: MCPTool[];
  resources: MCPResource[];
}

export class Webhook {
  event: string;
}

export class ManualIntegrationManifest {
  version: string;
  baseUrl: string;
  capabilities: Capability[];
  webhooks: Webhook[];
}

export enum IntegrationType {
  MANUAL = 'MANUAL',
  MCP =  'MCP'
}
export enum IntegrationAuthType {
  OAUTH = 'OAUTH',
  API_KEY = 'API_KEY',
  JWT = 'JWT'
}

@Entity("integrations")
export class IntegrationEntity extends BaseEntity {
  @Field({ type: "enum", enum: IntegrationType, required: true, description: "The type of the integration" })
  @Column({ type: "enum", enum: IntegrationType })
  type: IntegrationType;

  @Field({ type: "enum", enum: IntegrationAuthType, isArray: true, required: true, description: "The authentication methods of the integration" })
  @Column({ type: "jsonb", name: "auth_methods" })
  authMethods: IntegrationAuthType[];

  @Field({ 
    type: "oneOf",
    classes: [
      () => MCPIntegrationManifest,
      () => ManualIntegrationManifest
    ],
    required: true,
    description: "The name of the integration"
  })
  @Column({ type: "jsonb" })
  manifest: MCPIntegrationManifest | ManualIntegrationManifest;

  @Field({ type: "class", class: () => ConnectorEntity, isArray: true, required: true, description: "The connectors of the integration" })
  @OneToMany(() => ConnectorEntity, (c) => c.integration)
  connectors: ConnectorEntity[];
}