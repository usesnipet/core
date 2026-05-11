import { Module } from "@nestjs/common";

import { NodeTypeController } from "./node-type.controller";
import { NodeTypeResolver } from "./node-type.resolver";
import { NodeTypeService } from "./node-type.service";

@Module({
  controllers: [NodeTypeController],
  providers: [NodeTypeService, NodeTypeResolver],
  exports: [NodeTypeService],
})
export class NodeTypeModule {}
