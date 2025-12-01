import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { IntegrationController } from "./integration.controller";
import { IntegrationService } from "./integration.service";

@Module({
  imports: [HTTPContextModule, DatabaseModule],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: []
})
export class IntegrationModule {}
