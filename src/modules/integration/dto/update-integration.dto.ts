import { IntegrationEntity, ManualIntegrationManifest, MCPIntegrationManifest } from "@/entities";
import { FromParams } from "@/shared/controller/decorators";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class UpdateIntegrationDto extends PickType(IntegrationEntity, ["name", "type", "authMethods"]) {
  @FromParams("id")
  id: string;

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