import { Module } from "@nestjs/common";

import { NodeTypeResolver } from "./node-type.resolver";
import { NodeTypeService } from "./node-type.service";

@Module({
  providers: [NodeTypeService, NodeTypeResolver],
  exports: [NodeTypeService],
})
export class NodeTypeModule {}
