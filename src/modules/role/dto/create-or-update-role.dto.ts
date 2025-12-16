import { KnowledgeBaseRoleConfig } from "./knowledge-base-role-config.dto";
import { KnowledgeBaseRoleConnectorConfig } from "./knowledge-base-role-connector-config.dto";
import { ApiExtraModels, PickType } from "@nestjs/swagger";
import { Field } from "@/shared/model";
import { RoleEntity } from "@/entities";

@ApiExtraModels(KnowledgeBaseRoleConfig, KnowledgeBaseRoleConnectorConfig)
export class CreateOrUpdateRoleDto extends PickType(RoleEntity, ["name"]) {

  @Field({ type: "class", class: () => KnowledgeBaseRoleConfig, isArray: true, required: false })
  knowledgeBases?: Array<KnowledgeBaseRoleConfig>;
}


export class CreateRoleResponseDto extends RoleEntity {
  @Field({ type: "string", required: true, description: "The api key of the role" })
  apiKey: string;

  constructor(data: Partial<RoleEntity>, apiKey: string) {
    super(data);
    this.apiKey = apiKey;
  }

  static fromEntity(entity: RoleEntity, apiKey: string): CreateRoleResponseDto {
    return new CreateRoleResponseDto(entity, apiKey);
  }
}