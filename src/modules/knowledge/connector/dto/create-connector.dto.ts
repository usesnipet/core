import { ConnectorEntity } from "@/entities";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class CreateConnectorDto extends PickType(ConnectorEntity, ["name", "integrationId"]) {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}