import { Capability, IntegrationAuthType, IntegrationEntity, IntegrationType } from "@/entities";
import { Feature } from "@/entities/feature";
import { Service } from "@/shared/service";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

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
}