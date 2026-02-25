import { Field } from "@/shared/model";

export class UpdateConnectorDto {
  @Field({ type: "string", required: true, description: "The name of the connector", max: 255 })
  name: string;

  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}