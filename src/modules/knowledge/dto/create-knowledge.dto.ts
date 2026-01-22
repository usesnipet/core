import { Field } from "@/shared/model";
import { Column } from "typeorm";

export class CreateKnowledgeDto {
  @Field({ type: "string", min: 1, max: 255, description: "The name of the knowledge base" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "string", description: "The namespace of the knowledge base", nullable: true, required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  namespace?: string | null;
}