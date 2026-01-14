import { Field } from "@/shared/model";

export class ReferenceDto {
  @Field({ type: "string", required: true, uuid: true })
  referenceId: string;

  @Field({ type: "string", required: true })
  referenceName: string;

  @Field({ type: "object", additionalProperties: true })
  data: any;
}
