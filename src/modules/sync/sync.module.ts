import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { NodeModule } from "../node/node.module";
import { NodeTypeModule } from "../node-type/node-type.module";
import { PackageModule } from "../package/package.module";
import { SyncService } from "./sync.service";

@Module({
  imports: [PackageModule, NodeTypeModule, ConfigModule, NodeModule],
  providers: [SyncService],
})
export class SyncModule {}

