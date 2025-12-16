import { Field } from "@/shared/model";
import { KbPermission } from "@/entities";
import { KnowledgeBaseRoleConnectorConfig } from "./knowledge-base-role-connector-config.dto";

export class KnowledgeBaseRoleConfig {
  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "enum", enum: KbPermission, required: true })
  permissions: KbPermission;

  @Field({ type: "class", class: () => KnowledgeBaseRoleConnectorConfig, isArray: true, required: false })
  connectorPermissions: Array<KnowledgeBaseRoleConnectorConfig>;
}
