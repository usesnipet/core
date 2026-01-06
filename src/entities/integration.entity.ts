import { Column, Entity, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { Capability } from "./capability";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";
import { Feature } from "./feature";
import { ApiExtraModels } from "@nestjs/swagger";

export class MCPTool {
  @Field({
    type: "string",
    required: true,
    description: "The unique key of the tool"
  })
  key: string;

  @Field({
    type: "string",
    required: true,
    description: "The title of the tool"
  })
  title: string;

  @Field({
    type: "string",
    required: false,
    description: "The description of the tool"
  })
  description?: string;

  @Field({
    type: "object",
    additionalProperties: true,
    required: true,
    description: "The input schema of the tool"
  })
  inputSchema: Record<string, any>;

  @Field({
    type: "object",
    additionalProperties: true,
    required: true,
    description: "The output schema of the tool"
  })
  outputSchema: Record<string, any>;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false,
    description: "Additional annotations of the tool"
  })
  annotations: any;
}

export class MCPResource {
  @Field({
    type: "string",
    required: true,
    description: "The unique key of the resource"
  })
  key: string;

  @Field({
    type: "string",
    required: true,
    description: "The title of the resource"
  })
  title: string;

  @Field({
    type: "string",
    required: false,
    description: "The description of the resource"
  })
  description?: string;

  @Field({
    type: "object",
    additionalProperties: true,
    required: true,
    description: "The schema of the resource"
  })
  schema: Record<string, any>;
}

export class MCPIntegrationManifest {
  @Field({
    type: "string",
    required: true,
    description: "The version of the integration"
  })
  version: string;

  @Field({
    type: "string",
    required: true,
    description: "The base url of the integration"
  })
  baseUrl: string;

  @Field({
    type: "enum",
    enum: Capability,
    isArray: true,
    required: true,
    description: "The capabilities of the integration"
  })
  capabilities: Capability[];

  @Field({
    type: "enum",
    enum: Feature,
    isArray: true,
    required: true,
    description: "The features of the integration"
  })
  features: Feature[];

  @Field({
    type: "class",
    class: () => MCPTool,
    isArray: true,
    required: true,
    description: "The tools provided by the integration"
  })
  tools: MCPTool[];

  @Field({
    type: "class",
    class: () => MCPResource,
    isArray: true,
    required: true,
    description: "The resources exposed by the integration"
  })
  resources: MCPResource[];
}

export class Webhook {
  @Field({
    type: "string",
    required: true,
    description: "On call this event in core, this webhook will be called"
  })
  event: string;

  @Field({
    type: "string",
    required: true,
    description: "The url of the webhook",
    url: true
  })
  url: string;
}

export class ManualIntegrationManifest {
  @Field({ type: "string", required: true, description: "The version of the integration" })
  version: string;

  @Field({ type: "string", required: true, description: "The base url of the integration" })
  baseUrl: string;

  @Field({
    type: "enum",
    enum: Capability,
    isArray: true,
    required: true,
    description: "The capabilities of the integration"
  })
  capabilities: Capability[];

  @Field({
    type: "enum",
    enum: Feature,
    isArray: true,
    required: true,
    description: "The name of the integration"
  })
  features: Feature[];

  @Field({
    type: "class",
    class: () => Webhook,
    isArray: true,
    required: false,
    description: "The webhooks of the integration"
  })
  webhooks?: Webhook[];
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

@ApiExtraModels(MCPIntegrationManifest, ManualIntegrationManifest, Webhook, MCPResource, MCPTool)
@Entity("integrations")
export class IntegrationEntity extends BaseEntity {
  @Field({ type: "string", required: true, description: "The name of the integration" })
  @Column({ type: "varchar", length: 255 })
  name: string;

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
    description: "The manifest of the integration"
  })
  @Column({ type: "jsonb" })
  manifest: MCPIntegrationManifest | ManualIntegrationManifest;

  @Field({ type: "class", class: () => ConnectorEntity, isArray: true, required: true, description: "The connectors of the integration" })
  @OneToMany(() => ConnectorEntity, (c) => c.integration)
  connectors: ConnectorEntity[];

  constructor(data: Partial<IntegrationEntity>) {
    super(data);
    Object.assign(this, data);
  }
}