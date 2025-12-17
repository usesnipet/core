import { ApiKeyEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { ApiKeyService } from "./api-key.service";
import { CreateOrUpdateApiKeyDto } from "./dto/create-or-update-api-key.dto";
import { Permission } from "@/lib/permissions";

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
  constructor(service: ApiKeyService) {
    super(service);
  }
}