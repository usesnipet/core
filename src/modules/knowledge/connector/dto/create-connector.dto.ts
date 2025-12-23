import { ConnectorEntity } from "@/entities";
import { FromParams } from "@/shared/controller/decorators";
import { PickType } from "@nestjs/swagger";

export class CreateConnectorDto extends PickType(ConnectorEntity, ["name", "integrationId"]) {
  @FromParams("knowledgeId")
  knowledgeId: string;
}