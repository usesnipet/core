import { IntegrationEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { IntegrationService } from "./integration.service";
import { Permission } from "@/lib/permissions";
import { CreateIntegrationDto } from "./dto/create-integration.dto";
import { UpdateIntegrationDto } from "./dto/update-integration.dto";

@Controller("integration")
export class IntegrationController extends BaseController({
  entity: IntegrationEntity,
  createDto: CreateIntegrationDto,
  updateDto: UpdateIntegrationDto,
  requiredPermissions: {
    create:   [Permission.CREATE_INTEGRATION],
    update:   [Permission.UPDATE_INTEGRATION],
    delete:   [Permission.DELETE_INTEGRATION],
    find:     [Permission.READ_INTEGRATION],
    findByID: [Permission.READ_INTEGRATION]
  }
}) {
  constructor(service: IntegrationService) {
    super(service);
  }
}