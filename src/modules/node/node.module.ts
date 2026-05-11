import { Module } from "@nestjs/common";

import { NodeController } from "./node.controller";
import { NodeResolver } from "./node.resolver";
import { NodeService } from "./node.service";

@Module({
  controllers: [NodeController],
  providers: [NodeService, NodeResolver],
  exports: [NodeService],
})
export class NodeModule {}

