import { SessionEntity } from "@/entities";
import { KnowledgeId } from "@/shared/controller/decorators";
import { PickType } from "@nestjs/swagger";

export class CreateSessionDto extends PickType(SessionEntity, ['name', 'type', 'metadata']) {
  @KnowledgeId()
  knowledgeId: string;
}