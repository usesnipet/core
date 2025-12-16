import { RoleAssignmentEntity, RoleConnectorPermissionEntity, RoleEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EntityManager, FindOptionsWhere, In } from "typeorm";
import { CreateOrUpdateRoleDto, CreateRoleResponseDto } from "./dto/create-or-update-role.dto";
import { env } from "@/env";
import { ConnectorService } from "../connector/connector.service";
import { KnowledgeBaseRoleConfig } from "./dto/knowledge-base-role-config.dto";

@Injectable()
export class RoleService extends Service<RoleEntity> {
  logger = new Logger(RoleService.name);
  entity = RoleEntity;

  @Inject() private readonly connectorService: ConnectorService;

  override async create(input: CreateOrUpdateRoleDto, manager?: EntityManager): Promise<CreateRoleResponseDto>;
  override async create(input: CreateOrUpdateRoleDto[], manager?: EntityManager): Promise<CreateRoleResponseDto[]>;
  override async create(
    input: CreateOrUpdateRoleDto | CreateOrUpdateRoleDto[],
    manager?: EntityManager
  ): Promise<CreateRoleResponseDto | CreateRoleResponseDto[]> {
    const isArray = Array.isArray(input);
    const dtoList = isArray ? input : [input];

    const rolesToCreate = await Promise.all(dtoList.map(async (dto) => {
      const { roleAssignments } = await this.createOrUpdateRoleAssignments(dto.knowledgeBases);
      const key = RoleEntity.generateKey(env.NODE_ENV);
      return new RoleEntity({
        name: dto.name,
        key,
        keyHash: RoleEntity.toHash(key),
        rateLimit: env.DEFAULT_RATE_LIMIT,
        roleAssignments
      });
    }));

    const result = await this.repository(manager).save(rolesToCreate);
    return isArray ?
      result.map(r => CreateRoleResponseDto.fromEntity(r, r.key)) :
      CreateRoleResponseDto.fromEntity(result[0], result[0].key);
  }

  override async update(
    id: string | FindOptionsWhere<RoleEntity>,
    input: CreateOrUpdateRoleDto,
    manager?: EntityManager
  ): Promise<void> {
    let roles = await this.repository(manager).find({ where: typeof id === "string" ? { id } : id });
    if (!roles) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (input.name) {
      roles.map(r => r.name = input.name);
    }

    if (input.knowledgeBases) {
      const { roleAssignments } = await this.createOrUpdateRoleAssignments(input.knowledgeBases);
      roles.map(r => r.roleAssignments = roleAssignments);
    }

    await this.repository(manager).save(roles);
  }

  private async createOrUpdateRoleAssignments(
    knowledgeBases?: KnowledgeBaseRoleConfig[]
  ): Promise<{ roleAssignments: RoleAssignmentEntity[] }> {
    const roleAssignments: RoleAssignmentEntity[] = [];

    if (knowledgeBases && knowledgeBases.length > 0) {
      const connectorIds = knowledgeBases.flatMap(kb =>
        kb.connectorPermissions?.map(cp => cp.connectorId) ?? []
      );
      const uniqueConnectorIds = [...new Set(connectorIds)];
      const connectors = await this.connectorService.find({
        where: { id: In(uniqueConnectorIds) }, relations: ["integration"]
      });

      for (const kb of knowledgeBases) {
        const connectorPermissions: RoleConnectorPermissionEntity[] = [];
        if (kb.connectorPermissions) {
          for (const cp of kb.connectorPermissions) {
            const integration = connectors.find(c => c.id === cp.connectorId)?.integration;
            connectorPermissions.push(new RoleConnectorPermissionEntity({
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
        roleAssignments.push(new RoleAssignmentEntity({
          knowledgeId: kb.knowledgeId,
          kbPermissions: kb.permissions,
          connectorPermissions: connectorPermissions
        }));
      }
    }
    return { roleAssignments };
  }
}