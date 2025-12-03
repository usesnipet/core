import { ConnectorEntity } from "@/entities";
import { PickType } from "@nestjs/swagger";

export class CreateConnectorDto extends PickType(ConnectorEntity, ["integrationId", "knowledgeId"]) {}