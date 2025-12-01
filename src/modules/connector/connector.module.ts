import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { ConnectorController } from "./connector.controller";
import { ConnectorService } from "./connector.service";

@Module({
  imports: [HTTPContextModule, DatabaseModule],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: []
})
export class ConnectorModule {}
