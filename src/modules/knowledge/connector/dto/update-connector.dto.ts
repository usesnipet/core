import { ConnectorEntity } from "@/entities";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class UpdateConnectorDto extends PickType(ConnectorEntity, ["name"]) {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}