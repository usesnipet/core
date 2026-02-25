import { Field } from "@/shared/model";

export class CreateConnectorDto {
  @Field({ type: "string", required: true, description: "The name of the connector", max: 255 })
  name: string;

  @Field({ type: "string", required: true, uuid: true, description: "The integration id" })
  integrationId: string;

  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;
}