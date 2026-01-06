import { Field } from "@/shared/model";

export class StreamDto {
  @Field({ type: "string", source: "params", sourceKey: "id", uuid: true, required: true })
  executionId: string;
}