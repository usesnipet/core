import { KnowledgeEntity } from "@/entities";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class CreateKnowledgeDto extends PickType(KnowledgeEntity, ["name", "namespace"]) {}