import { KnowledgeEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class KnowledgeService extends Service<KnowledgeEntity> {
  logger = new Logger(KnowledgeService.name);
  entity = KnowledgeEntity;

}