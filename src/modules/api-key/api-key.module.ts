import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { ApiKeyController } from "./api-key.controller";
import { ApiKeyService } from "./api-key.service";
import { ConnectorModule } from "../connector/connector.module";

@Module({
  imports: [HTTPContextModule, DatabaseModule, ConnectorModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService]
})
export class ApiKeyModule {}
