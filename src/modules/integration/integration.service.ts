import { IntegrationEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class IntegrationService extends Service<IntegrationEntity> {
  logger = new Logger(IntegrationService.name);
  entity = IntegrationEntity;

}