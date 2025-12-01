import { RoleEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { RoleService } from "./role.service";

@Controller("role")
export class RoleController extends BaseController({ entity: RoleEntity }) {
  constructor(service: RoleService) {
    super(service);
  }
}