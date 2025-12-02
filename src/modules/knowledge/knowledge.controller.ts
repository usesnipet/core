import { KnowledgeEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { KnowledgeService } from "./knowledge.service";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";

@Controller("knowledge")
export class KnowledgeController extends BaseController({
  entity: KnowledgeEntity,
  createDto: CreateKnowledgeDto
}) {
  constructor(service: KnowledgeService) {
    super(service);
  }
}