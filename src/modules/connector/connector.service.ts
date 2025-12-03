import { ConnectorAuth, ConnectorEntity, ConnectorStateEntity, IntegrationAuthType } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, In, Repository } from "typeorm";
import { CreateConnectorDto } from "./dto/create-connector.dto";
import { IntegrationService } from "../integration/integration.service";

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
      return new ConnectorEntity({
        ...c,
        type: integration?.type,
        capabilities: integration?.manifest.capabilities,
        name: "Connector",
        config: integration?.manifest,
        auth: new ConnectorAuth({ type: integration?.authMethods[0] })
      })
    });
    return super.create(connectors, manager);
  }
}