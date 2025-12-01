import { IntegrationEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { IntegrationService } from "./integration.service";

@Controller("integration")
export class IntegrationController extends BaseController({ entity: IntegrationEntity }) {
  constructor(service: IntegrationService) {
    super(service);
  }
}