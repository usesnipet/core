import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { SnipetController } from "./snipet.controller";
import { SnipetService } from "./snipet.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
  ],
  controllers: [SnipetController],
  providers: [SnipetService],
  exports: [ SnipetService ],
})
export class SnipetModule {}
