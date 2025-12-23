import { ApiKeyAssignmentEntity, ApiKeyConnectorPermissionEntity, ApiKeyEntity } from "@/entities";
import { env } from "@/env";
import { permissionsToNumber, rootRole } from "@/lib/permissions";
import { Service } from "@/shared/service";
import {
  Inject, Injectable, Logger, NotFoundException, OnModuleInit, UnauthorizedException
} from "@nestjs/common";
import { EntityManager, FindOptionsWhere, In } from "typeorm";

import { ConnectorService } from "../connector/connector.service";

import { CreateApiKeyResponseDto, CreateOrUpdateApiKeyDto } from "./dto/create-or-update-api-key.dto";
import { KnowledgeBaseApiKeyConfig } from "./dto/knowledge-base-api-key-config.dto";

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

    if (isArray) {
      const result = await this.repository(manager).save(apiKeysToCreate);
      return result.map(r => CreateApiKeyResponseDto.fromEntity(r, r.key));
    } else {
      const result = await this.repository(manager).save(apiKeysToCreate[0]);
      return CreateApiKeyResponseDto.fromEntity(result, result.key);
    }
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

  validateApiKeyAssignments(apiKey: ApiKeyEntity, knowledgeBases?: KnowledgeBaseApiKeyConfig[]) {
    const permissionException = new UnauthorizedException("You do not have permission to create/update a api key with a higher permission than the one you have");
    for (const kn of knowledgeBases ?? []) {
      const apiKeyAssignment = apiKey.apiKeyAssignments?.find(a => a.knowledgeId === kn.knowledgeId);
      if (!apiKeyAssignment) throw permissionException;
      if (apiKeyAssignment.kbPermissions < kn.permissions) throw permissionException;
      for (const cp of kn.connectorPermissions ?? []) {
        const connectorPermission = apiKeyAssignment.connectorPermissions?.find(c => c.connectorId === cp.connectorId);
        if (!connectorPermission) throw permissionException;
        if (cp.resources?.some(r => !connectorPermission.resources?.includes(r))) throw permissionException;
        if (cp.tools?.some(t => !connectorPermission.tools?.includes(t))) throw permissionException;
        if (cp.webhookEvents?.some(e => !connectorPermission.webhookEvents?.includes(e))) throw permissionException;
      }
    }
  }

  private async createOrUpdateApiKeyAssignments(
    knowledgeBases?: KnowledgeBaseApiKeyConfig[]
  ): Promise<{ apiKeyAssignments: ApiKeyAssignmentEntity[] }> {
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException("You do not have permission to create/update a api key");
    this.validateApiKeyAssignments(apiKey, knowledgeBases);

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

  async getByKey(apiKeyHeader: string) {
    return this.findFirst({
      where: { keyHash: ApiKeyEntity.toHash(apiKeyHeader), revoked: false },
      relations: ["apiKeyAssignments.connectorPermissions"]
    });
  }
}