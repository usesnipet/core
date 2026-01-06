import { KnowledgeEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { KnowledgeService } from "./knowledge.service";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";
import { Permission } from "@/lib/permissions";
import { UpdateKnowledgeDto } from "./dto/update-knowledge.dto";

@Controller("knowledge")
export class KnowledgeController extends BaseController({
  entity: KnowledgeEntity,
  createDto: CreateKnowledgeDto,
  updateDto: UpdateKnowledgeDto,
  requiredPermissions: {
    create:   [Permission.CREATE_KNOWLEDGE],
    update:   [Permission.UPDATE_KNOWLEDGE],
    delete:   [Permission.DELETE_KNOWLEDGE],
    find:     [Permission.READ_KNOWLEDGE],
    findByID: [Permission.READ_KNOWLEDGE]
  }
}) {
  constructor(service: KnowledgeService) {
    super(service);
  }
}