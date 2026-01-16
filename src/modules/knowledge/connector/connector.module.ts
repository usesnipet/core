import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { ConnectorController } from "./connector.controller";
import { ConnectorService } from "./connector.service";
import { IntegrationModule } from "../../integration/integration.module";

@Module({
  imports: [HTTPContextModule, DatabaseModule, IntegrationModule],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService]
})
export class ConnectorModule {}
