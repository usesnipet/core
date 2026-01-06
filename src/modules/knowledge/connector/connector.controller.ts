import { ConnectorEntity } from "@/entities";
import { Permission } from "@/lib/permissions";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { ConnectorService } from "./connector.service";
import { CreateConnectorDto } from "./dto/create-connector.dto";
import { UpdateConnectorDto } from "./dto/update-connector.dto";

@Controller("knowledge/:knowledgeId/connector")
export class ConnectorController extends BaseController({
  entity: ConnectorEntity,
  createDto: CreateConnectorDto,
  updateDto: UpdateConnectorDto,
  requiredPermissions: {
    create:   [Permission.CREATE_CONNECTOR],
    update:   [Permission.UPDATE_CONNECTOR],
    delete:   [Permission.DELETE_CONNECTOR],
    find:     [Permission.READ_CONNECTOR],
    findByID: [Permission.READ_CONNECTOR]
  }
}) {
  constructor(service: ConnectorService) {
    super(service);
  }
}