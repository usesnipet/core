import { Module } from "@nestjs/common";

import { ConfigResolver } from "./config.resolver";
import { ConfigService } from "./config.service";

@Module({
  providers: [ConfigService, ConfigResolver],
  exports: [ConfigService],
})
export class ConfigModule {}
