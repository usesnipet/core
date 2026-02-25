import { KnowledgeBaseApiKeyConfig } from "./knowledge-base-api-key-config.dto";
import { KnowledgeBaseApiKeyConnectorConfig } from "./knowledge-base-api-key-connector-config.dto";
import { ApiExtraModels } from "@nestjs/swagger";
import { Field } from "@/shared/model";
import { ApiKeyEntity } from "@/entities";

@ApiExtraModels(KnowledgeBaseApiKeyConfig, KnowledgeBaseApiKeyConnectorConfig)
export class CreateOrUpdateApiKeyDto {

  @Field({ type: "string", description: "The name of the api key" })
  name: string;

  @Field({ type: "class", class: () => KnowledgeBaseApiKeyConfig, isArray: true, required: false })
  knowledgeBases?: Array<KnowledgeBaseApiKeyConfig>;
}


export class CreateApiKeyResponseDto extends ApiKeyEntity {
  @Field({ type: "string", required: true, description: "The api key" })
  apiKey: string;

  constructor(data: Partial<ApiKeyEntity>, apiKey: string) {
    super(data);
    this.apiKey = apiKey;
  }

  static fromEntity(entity: ApiKeyEntity, apiKey: string): CreateApiKeyResponseDto {
    return new CreateApiKeyResponseDto(entity, apiKey);
  }
}