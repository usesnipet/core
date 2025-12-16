import { ConnectorAuth, ConnectorEntity, IntegrationEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EntityManager, In } from "typeorm";

import { IntegrationService } from "../integration/integration.service";
import { CreateConnectorDto } from "./dto/create-connector.dto";

@Injectable()
export class ConnectorService extends Service<ConnectorEntity> {
  logger = new Logger(ConnectorService.name);
  entity = ConnectorEntity;

  constructor(
    private readonly integrationService: IntegrationService
  ) {
    super();
  }

  override async create(input: CreateConnectorDto, manager?: EntityManager): Promise<ConnectorEntity>;
  override async create(input: CreateConnectorDto[], manager?: EntityManager): Promise<ConnectorEntity[]>;
  override async create(
    input: CreateConnectorDto | CreateConnectorDto[],
    manager?: EntityManager
  ): Promise<ConnectorEntity | ConnectorEntity[]> {
    const isArray = Array.isArray(input);
    const dtoList = isArray ? input : [input];
    const integrations = await this.integrationService.find({
      where: {
        id: In(dtoList.map((c) => c.integrationId))
      }
    });

    const connectors = dtoList.map((c) => {
      const integration = integrations.find((i) => i.id === c.integrationId);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${c.integrationId} not found`);
      }
      return this.createConnectorEntity(c, integration)
    });
    const result = await super.create(connectors, manager);
    return isArray ? result : result[0];
  }

  private createConnectorEntity(c: CreateConnectorDto, integration: IntegrationEntity): ConnectorEntity {
    return new ConnectorEntity({
      ...c,
      type: integration.type,
      capabilities: integration.manifest.capabilities,
      name: c.name ?? integration.name,
      config: integration.manifest,
      auth: integration.authMethods?.[0] ? new ConnectorAuth({ type: integration.authMethods[0] }) : undefined
    })
  }
}