import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";

@Module({
  imports: [HTTPContextModule, DatabaseModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: []
})
export class SessionModule {}
