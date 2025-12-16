import { KbPermission, PolicyMode, RoleEntity } from "@/entities";
import { Field } from "@/shared/model";
import { ApiExtraModels, PickType } from "@nestjs/swagger";

export class KnowledgeBaseRoleConnectorConfig {
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

export class KnowledgeBaseRoleConfig {
  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "enum", enum: KbPermission, required: true })
  permissions: KbPermission;

  @Field({ type: "class", class: () => KnowledgeBaseRoleConnectorConfig, isArray: true, required: false })
  connectorPermissions: Array<KnowledgeBaseRoleConnectorConfig>;
}

@ApiExtraModels(KnowledgeBaseRoleConfig, KnowledgeBaseRoleConnectorConfig)
export class CreateRoleDto extends PickType(RoleEntity, ["name"]) {

  @Field({ type: "class", class: () => KnowledgeBaseRoleConfig, isArray: true, required: false })
  knowledgeBases?: Array<KnowledgeBaseRoleConfig>;
}