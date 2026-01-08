import { KnowledgeEntity } from "@/entities";
import { PickType } from "@nestjs/swagger";

export class UpdateKnowledgeDto extends PickType(KnowledgeEntity, ["name"]) {}