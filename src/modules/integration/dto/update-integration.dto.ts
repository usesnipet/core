import { IntegrationAuthType, IntegrationType, ManualIntegrationManifest, MCPIntegrationManifest } from "@/entities";
import { Field } from "@/shared/model";

export class UpdateIntegrationDto {
  @Field({ type: "string", required: true, description: "The name of the integration" })
  name: string;

  @Field({ type: "enum", enum: IntegrationType, required: true, description: "The type of the integration" })
  type: IntegrationType;

  @Field({ type: "enum", enum: IntegrationAuthType, isArray: true, required: true, description: "The authentication methods of the integration" })
  authMethods: IntegrationAuthType[];

  @Field({
    type: "class",
    class: () => ManualIntegrationManifest,
    required: false,
    description: "Manual integration configuration"
  })
  manual?: ManualIntegrationManifest;

  @Field({
    type: "class",
    class: () => MCPIntegrationManifest,
    required: false,
    description: "MCP integration configuration"
  })
  mcp?: MCPIntegrationManifest;
}