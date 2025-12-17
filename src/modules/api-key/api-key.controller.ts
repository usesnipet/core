import { ApiKeyEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { ApiKeyService } from "./api-key.service";
import { CreateOrUpdateApiKeyDto } from "./dto/create-or-update-api-key.dto";

@Controller("api-key")
export class ApiKeyController extends BaseController({
  entity: ApiKeyEntity,
  createDto: CreateOrUpdateApiKeyDto,
  updateDto: CreateOrUpdateApiKeyDto
}) {
  constructor(service: ApiKeyService) {
    super(service);
  }
}