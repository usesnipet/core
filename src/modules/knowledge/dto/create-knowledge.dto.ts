import { KnowledgeEntity } from "@/entities";
import { PickType } from "@nestjs/swagger";

export class CreateKnowledgeDto extends PickType(KnowledgeEntity, ["name", "namespace"]) {}