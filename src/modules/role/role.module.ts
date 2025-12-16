import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { ConnectorModule } from "../connector/connector.module";

@Module({
  imports: [HTTPContextModule, DatabaseModule, ConnectorModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: []
})
export class RoleModule {}
