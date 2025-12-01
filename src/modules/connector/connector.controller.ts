import { ConnectorEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { ConnectorService } from "./connector.service";

@Controller("connector")
export class ConnectorController extends BaseController({ entity: ConnectorEntity }) {
  constructor(service: ConnectorService) {
    super(service);
  }
}