import { SnipetEntity } from "@/entities";
import { Field } from "@/shared/model";
import { PickType } from "@nestjs/swagger";

export class CreateOrUpdateSnipetDto extends PickType(SnipetEntity, ['name', "metadata"]) {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}