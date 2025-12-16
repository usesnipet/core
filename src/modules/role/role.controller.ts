import { RoleEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { RoleService } from "./role.service";
import { CreateOrUpdateRoleDto } from "./dto/create-or-update-role.dto";

@Controller("role")
export class RoleController extends BaseController({
  entity: RoleEntity,
  createDto: CreateOrUpdateRoleDto,
  updateDto: CreateOrUpdateRoleDto
}) {
  constructor(service: RoleService) {
    super(service);
  }
}