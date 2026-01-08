import { IntegrationEntity, ManualIntegrationManifest, MCPIntegrationManifest } from "@/entities";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class UpdateIntegrationDto extends PickType(IntegrationEntity, ["name", "type", "authMethods"]) {
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