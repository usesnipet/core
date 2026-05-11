import { Module } from "@nestjs/common";

import { ConfigController } from "./config.controller";
import { ConfigResolver } from "./config.resolver";
import { ConfigService } from "./config.service";

@Module({
  controllers: [ConfigController],
  providers: [ConfigService, ConfigResolver],
  exports: [ConfigService],
})
export class ConfigModule {}
