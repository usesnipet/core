import { Field } from "@/shared/model";

export class GetAssetsDto {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}