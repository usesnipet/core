import { ConnectorEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { ConnectorService } from "./connector.service";
import { CreateConnectorDto } from "./dto/create-connector.dto";

@Controller("connector")
export class ConnectorController extends BaseController({
  entity: ConnectorEntity,
  createDto: CreateConnectorDto
}) {
  constructor(service: ConnectorService) {
    super(service);
  }
}