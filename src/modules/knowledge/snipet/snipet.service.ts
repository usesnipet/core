import { SnipetEntity } from "@/entities";
import { Injectable, Logger } from "@nestjs/common";

import { SubKnowledgeService } from "@/shared/services/sub-knowledge.service";

@Injectable()
export class SnipetService extends SubKnowledgeService<SnipetEntity> {
  logger = new Logger(SnipetService.name);
  entity = SnipetEntity;
}