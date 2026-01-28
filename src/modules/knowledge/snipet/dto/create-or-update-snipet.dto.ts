import { Field } from "@/shared/model";

export class CreateOrUpdateSnipetDto {
  @Field({ type: "string", required: false, nullable: true })
  name?: string | null;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false,
    nullable: true,
    description: "Metadata of the snipet",
  })
  metadata: Record<string, any> | null = null;

  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}