import { Module } from "@nestjs/common";

import { TagController } from "./tag.controller";
import { TagResolver } from "./tag.resolver";
import { TagService } from "./tag.service";

@Module({
  controllers: [TagController],
  providers: [TagService, TagResolver],
  exports: [TagService],
})
export class TagModule {}

