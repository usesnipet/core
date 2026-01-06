import { KnowledgeEntity } from "@/entities";
import { FromParams } from "@/shared/controller/decorators";
import { PickType } from "@nestjs/swagger";

export class UpdateKnowledgeDto extends PickType(KnowledgeEntity, ["name"]) {
  @FromParams("id")
  id: string;
}