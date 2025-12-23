import { ApiKeyEntity } from "@/entities";
import { Permission } from "@/lib/permissions";
import { BaseController } from "@/shared/controller";
import { Controller, HttpGet } from "@/shared/controller/decorators";

import { ApiKeyService } from "./api-key.service";
import { CreateOrUpdateApiKeyDto } from "./dto/create-or-update-api-key.dto";

@Controller("api-key")
export class ApiKeyController extends BaseController({
  entity: ApiKeyEntity,
  createDto: CreateOrUpdateApiKeyDto,
  updateDto: CreateOrUpdateApiKeyDto,
  requiredPermissions: {
    create:   [Permission.CREATE_API_KEY],
    update:   [Permission.UPDATE_API_KEY],
    delete:   [Permission.DELETE_API_KEY],
    find:     [Permission.READ_API_KEY],
    findByID: [Permission.READ_API_KEY]
  }
}) {
  constructor(public service: ApiKeyService) {
    super(service);
  }

  @HttpGet("self")
  async self() {
    return this.service.self();
  }
}