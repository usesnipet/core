import { Capability, IntegrationAuthType, IntegrationEntity, IntegrationType } from "@/entities";
import { Feature } from "@/entities/feature";
import { Service } from "@/shared/service";
import { BadRequestException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EntityManager, FindOptionsWhere } from "typeorm";
import { CreateIntegrationDto } from "./dto/create-integration.dto";
import { UpdateIntegrationDto } from "./dto/update-integration.dto";

@Injectable()
export class IntegrationService extends Service<IntegrationEntity> implements OnModuleInit {
  logger = new Logger(IntegrationService.name);
  entity = IntegrationEntity;

  async onModuleInit() {
    const defaultIntegration = new IntegrationEntity({
      authMethods: [IntegrationAuthType.API_KEY],
      name: "File Manager",
      manifest: {
        baseUrl: "",
        capabilities: [Capability.INGEST],
        features: [Feature.FILE_MANAGEMENT],
        version: "1.0.0",
        webhooks: []
      },
      type: IntegrationType.MANUAL
    });
    if ((await this.repository().count()) === 0) {
      await this.create(defaultIntegration);
    }
  }

  override async create(input: CreateIntegrationDto, manager?: EntityManager): Promise<IntegrationEntity>;
  override async create(input: CreateIntegrationDto[], manager?: EntityManager): Promise<IntegrationEntity[]>;
  override async create(input: CreateIntegrationDto | CreateIntegrationDto[], manager?: EntityManager): Promise<IntegrationEntity | IntegrationEntity[]> {
    const entities = Array.isArray(input) 
      ? input.map(dto => new IntegrationEntity({ 
          authMethods: dto.authMethods,
          manifest: dto.type === IntegrationType.MANUAL ? dto.manual : dto.mcp,
          name: dto.name,
          type: dto.type
        }))
      : new IntegrationEntity({
          authMethods: input.authMethods,
          manifest: input.type === IntegrationType.MANUAL ? input.manual : input.mcp,
          name: input.name,
          type: input.type
        });
    if (Array.isArray(entities)) {
      // Handle array case - validate each entity
      for (const entity of entities) {
        if (!entity.manifest) {
          throw new BadRequestException('Manifest is required for all integrations');
        }
      }
    } else {
      if (!entities.manifest) {
        throw new BadRequestException('Manifest is required for all integrations');
      }
    }
    return Array.isArray(input) ? super.create(entities as IntegrationEntity[], manager) : super.create(entities as IntegrationEntity, manager);
  }

  override async update(
    id: string | FindOptionsWhere<IntegrationEntity>,
    input: UpdateIntegrationDto,
    manager?: EntityManager
  ): Promise<void> {
    const entity = new IntegrationEntity({ 
      authMethods: input.authMethods,
      manifest: input.type === IntegrationType.MANUAL ? input.manual : input.mcp,
      name: input.name,
      type: input.type
    });

    if (!entity.manifest) throw new BadRequestException('Manifest is required for all integrations');
    return super.update(id, entity, manager);
  }
}