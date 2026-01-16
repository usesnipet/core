import { PolicyMode } from "@/entities/api-key-connector-permission.entity";
import { Field } from "@/shared/model";

export class KnowledgeBaseApiKeyConnectorConfig {
  @Field({ type: "string", required: true, uuid: true })
  connectorId: string;

  @Field({ type: "enum", enum: PolicyMode, required: true })
  policyMode: PolicyMode;

  @Field({ type: "string", isArray: true, required: false, nullable: true })
  tools?: string[];

  @Field({ type: "string", isArray: true, required: false, nullable: true })
  resources?: string[];

  @Field({ type: "string", isArray: true, required: false, nullable: true })
  webhookEvents?: string[];
}
