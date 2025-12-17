import { ApiKeyAssignmentEntity, ApiKeyConnectorPermissionEntity, ApiKeyEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { EntityManager, FindOptionsWhere, In } from "typeorm";
import { CreateOrUpdateApiKeyDto, CreateApiKeyResponseDto } from "./dto/create-or-update-api-key.dto";
import { env } from "@/env";
import { ConnectorService } from "../connector/connector.service";
import { KnowledgeBaseApiKeyConfig } from "./dto/knowledge-base-api-key-config.dto";
import { permissionsToNumber, rootRole } from "@/lib/permissions";

@Injectable()
export class ApiKeyService extends Service<ApiKeyEntity> implements OnModuleInit {
  logger = new Logger(ApiKeyService.name);
  entity = ApiKeyEntity;

  @Inject() private readonly connectorService: ConnectorService;

  async onModuleInit() {
    const rootKey = await this.findFirst({ where: { root: true } });

    if (!rootKey) {
      const key = env.ROOT_API_KEY || ApiKeyEntity.generateKey(env.NODE_ENV);
      const keyHash = ApiKeyEntity.toHash(key);

      const newRootKey = new ApiKeyEntity({
        name: "root",
        key,
        keyHash,
        root: true,
        permissions: permissionsToNumber(rootRole.permissions),
        rateLimit: env.DEFAULT_RATE_LIMIT,
      });

      await this.repository().save(newRootKey);
      this.logger.log(`Root API key created: ${key}`);
    }
  }

  override async create(input: CreateOrUpdateApiKeyDto, manager?: EntityManager): Promise<CreateApiKeyResponseDto>;
  override async create(input: CreateOrUpdateApiKeyDto[], manager?: EntityManager): Promise<CreateApiKeyResponseDto[]>;
  override async create(
    input: CreateOrUpdateApiKeyDto | CreateOrUpdateApiKeyDto[],
    manager?: EntityManager
  ): Promise<CreateApiKeyResponseDto | CreateApiKeyResponseDto[]> {
    const isArray = Array.isArray(input);
    const dtoList = isArray ? input : [input];

    const apiKeysToCreate = await Promise.all(dtoList.map(async (dto) => {
      const { apiKeyAssignments } = await this.createOrUpdateApiKeyAssignments(dto.knowledgeBases);
      const key = ApiKeyEntity.generateKey(env.NODE_ENV);
      return new ApiKeyEntity({
        name: dto.name,
        key,
        keyHash: ApiKeyEntity.toHash(key),
        rateLimit: env.DEFAULT_RATE_LIMIT,
        apiKeyAssignments
      });
    }));

    const result = await this.repository(manager).save(apiKeysToCreate);
    return isArray ?
      result.map(r => CreateApiKeyResponseDto.fromEntity(r, r.key)) :
      CreateApiKeyResponseDto.fromEntity(result[0], result[0].key);
  }

  override async update(
    id: string | FindOptionsWhere<ApiKeyEntity>,
    input: CreateOrUpdateApiKeyDto,
    manager?: EntityManager
  ): Promise<void> {
    let apiKeys = await this.repository(manager).find({ where: typeof id === "string" ? { id } : id });
    if (!apiKeys) {
      throw new NotFoundException(`ApiKey with id ${id} not found`);
    }

    if (input.name) {
      apiKeys.map(r => r.name = input.name);
    }

    if (input.knowledgeBases) {
      const { apiKeyAssignments } = await this.createOrUpdateApiKeyAssignments(input.knowledgeBases);
      apiKeys.map(r => r.apiKeyAssignments = apiKeyAssignments);
    }

    await this.repository(manager).save(apiKeys);
  }

  private async createOrUpdateApiKeyAssignments(
    knowledgeBases?: KnowledgeBaseApiKeyConfig[]
  ): Promise<{ apiKeyAssignments: ApiKeyAssignmentEntity[] }> {
    const apiKeyAssignments: ApiKeyAssignmentEntity[] = [];

    if (knowledgeBases && knowledgeBases.length > 0) {
      const connectorIds = knowledgeBases.flatMap(kb =>
        kb.connectorPermissions?.map(cp => cp.connectorId) ?? []
      );
      const uniqueConnectorIds = [...new Set(connectorIds)];
      const connectors = await this.connectorService.find({
        where: { id: In(uniqueConnectorIds) }, relations: ["integration"]
      });

      for (const kb of knowledgeBases) {
        const connectorPermissions: ApiKeyConnectorPermissionEntity[] = [];
        if (kb.connectorPermissions) {
          for (const cp of kb.connectorPermissions) {
            const integration = connectors.find(c => c.id === cp.connectorId)?.integration;
            connectorPermissions.push(new ApiKeyConnectorPermissionEntity({
              connectorId: cp.connectorId,
              policyMode: cp.policyMode,
              tools: cp.tools,
              resources: cp.resources,
              webhookEvents: cp.webhookEvents,
              manifestSnapshot: integration?.manifest,
              manifestVersion: integration?.manifest.version
            }));
          }
        }
        apiKeyAssignments.push(new ApiKeyAssignmentEntity({
          knowledgeId: kb.knowledgeId,
          kbPermissions: kb.permissions,
          connectorPermissions: connectorPermissions
        }));
      }
    }
    return { apiKeyAssignments };
  }
}