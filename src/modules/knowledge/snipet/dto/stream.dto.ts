import { Field } from "@/shared/model";

export class StreamDto {
  @Field({ type: "string", source: "params", sourceKey: "knowledgeId", uuid: true, required: true })
  knowledgeId: string;

  @Field({ type: "string", source: "params", sourceKey: "snipetId", uuid: true, required: true })
  snipetId: string;

  @Field({ type: "string", source: "params", sourceKey: "id", uuid: true, required: true })
  executionId: string;
}