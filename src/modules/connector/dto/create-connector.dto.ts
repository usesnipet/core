import { ConnectorEntity } from "@/entities";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class CreateConnectorDto extends PickType(ConnectorEntity, ["integrationId", "knowledgeId"]) {
  @Field({
    type: "string",
    required: true,
    description: "The name of the connector"
  })
  name: string;
}