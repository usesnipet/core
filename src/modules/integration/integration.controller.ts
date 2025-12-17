import { IntegrationEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { IntegrationService } from "./integration.service";
import { Permission } from "@/lib/permissions";

@Controller("integration")
export class IntegrationController extends BaseController({
  entity: IntegrationEntity,
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