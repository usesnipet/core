import { Field } from "@/shared/model";

export class UpdateKnowledgeDto {
  @Field({ type: "string", min: 10, description: "The name of the knowledge base", required: true })
  name: string;
}