import { RoleEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";

@Controller("role")
export class RoleController extends BaseController({
  entity: RoleEntity,
  createDto: CreateRoleDto
}) {
  constructor(service: RoleService) {
    super(service);
  }
}