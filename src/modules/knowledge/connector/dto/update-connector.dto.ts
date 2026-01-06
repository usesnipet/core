import { ConnectorEntity } from "@/entities";
import { FromParams } from "@/shared/controller/decorators";
import { PickType } from "@nestjs/swagger";

export class UpdateConnectorDto extends PickType(ConnectorEntity, ["name"]) {
  @FromParams("knowledgeId")
  knowledgeId: string;
}