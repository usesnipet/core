import { NodeTypeModule } from "@/modules/node-type/node-type.module";
import { Module } from "@nestjs/common";

import { PackageResolver } from "./package.resolver";
import { PackageService } from "./package.service";

@Module({
  imports: [NodeTypeModule],
  providers: [PackageService, PackageResolver],
  exports: [PackageService],
})
export class PackageModule {}

