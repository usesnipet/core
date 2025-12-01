import { KnowledgeEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";

import { KnowledgeService } from "./knowledge.service";

@Controller("knowledge")
export class KnowledgeController extends BaseController({ entity: KnowledgeEntity }) {
  constructor(service: KnowledgeService) {
    super(service);
  }
}