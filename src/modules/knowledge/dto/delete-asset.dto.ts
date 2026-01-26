import { Field } from "@/shared/model";

export class DeleteAssetDto {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;

  @Field({ type: "string", required: true, uuid: true, source: "params" })
  id: string;
}