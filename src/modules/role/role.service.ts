import { ConnectorEntity, RoleAssignmentEntity, RoleConnectorPermissionEntity, RoleEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { EntityManager, In } from "typeorm";
import { CreateRoleDto } from "./dto/create-role.dto";
import { env } from "@/env";
import { ConnectorService } from "../connector/connector.service";

@Injectable()
export class RoleService extends Service<RoleEntity> {
  logger = new Logger(RoleService.name);
  entity = RoleEntity;

  @Inject() private readonly connectorService: ConnectorService;

  override async create(input: CreateRoleDto, manager?: EntityManager): Promise<RoleEntity>;
  override async create(input: CreateRoleDto[], manager?: EntityManager): Promise<RoleEntity[]>;
  override async create(
    input: CreateRoleDto | CreateRoleDto[],
    manager?: EntityManager
  ): Promise<RoleEntity | RoleEntity[]> {
    if (Array.isArray(input)) {
      const connectorIds = input.flatMap(role =>
        role.knowledgeBases?.flatMap(kb => kb.connectorPermissions.map(cp => cp.connectorId)) ?? []
      );
      const uniqueConnectorIds = [...new Set(connectorIds)];
      const connectors = await this.connectorService.find({
        where: { id: In(uniqueConnectorIds) }, relations: [ "integration" ]
      });
      return this.repository(manager).save(input.map(i => this.createDtoToEntity(i, connectors)));
    } else {
      const connectorIds = input.knowledgeBases?.flatMap(kb =>
        kb.connectorPermissions.map(cp => cp.connectorId)
      ) ?? [];
      const uniqueConnectorIds = [...new Set(connectorIds)];
      const connectors = await this.connectorService.find({
        where: { id: In(uniqueConnectorIds) }, relations: [ "integration" ]
      });
      return this.repository(manager).save(await this.createDtoToEntity(input, connectors));
    }
  }

  private createDtoToEntity(input: CreateRoleDto, connectors: ConnectorEntity[]): RoleEntity {
    return new RoleEntity({
      name: input.name,
      keyHash: RoleEntity.toHash(RoleEntity.generateKey(env.NODE_ENV)),
      rateLimit: env.DEFAULT_RATE_LIMIT,
      roleAssignments: input.knowledgeBases?.map((kb) => new RoleAssignmentEntity({
        knowledgeId: kb.knowledgeId,
        kbPermissions: kb.permissions,
        connectorPermissions: kb.connectorPermissions.map(cp => {
          const integration = connectors.find(c => c.id === cp.connectorId)?.integration;
          return new RoleConnectorPermissionEntity({
            connectorId: cp.connectorId,
            policyMode: cp.policyMode,
            tools: cp.tools,
            resources: cp.resources,
            webhookEvents: cp.webhookEvents,
            manifestSnapshot: integration?.manifest,
            manifestVersion: integration?.manifest.version
          })
        })
      })) ?? []
    });
  }
}