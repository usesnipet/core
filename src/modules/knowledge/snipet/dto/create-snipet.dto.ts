import { SnipetEntity } from "@/entities";
import { KnowledgeId } from "@/shared/controller/decorators";
import { PickType } from "@nestjs/swagger";

export class CreateSnipetDto extends PickType(SnipetEntity, ['name', 'type', 'metadata']) {
  @KnowledgeId()
  knowledgeId: string;
}