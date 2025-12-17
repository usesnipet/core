import { Field } from "@/shared/model";
import { KbPermission } from "@/entities";
import { KnowledgeBaseApiKeyConnectorConfig } from "./knowledge-base-api-key-connector-config.dto";

export class KnowledgeBaseApiKeyConfig {
  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "enum", enum: KbPermission, required: true })
  permissions: KbPermission;

  @Field({ type: "class", class: () => KnowledgeBaseApiKeyConnectorConfig, isArray: true, required: false })
  connectorPermissions: Array<KnowledgeBaseApiKeyConnectorConfig>;
}
