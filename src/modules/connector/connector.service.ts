import { ConnectorEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ConnectorService extends Service<ConnectorEntity> {
  logger = new Logger(ConnectorService.name);
  entity = ConnectorEntity;

}