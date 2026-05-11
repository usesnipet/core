import { NodeTypeModule } from "@/modules/node-type/node-type.module";
import { Module } from "@nestjs/common";

import { PackageController } from "./package.controller";
import { PackageService } from "./package.service";

@Module({
  imports: [NodeTypeModule],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}

