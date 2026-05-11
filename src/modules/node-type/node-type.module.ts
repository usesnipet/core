import { Module } from "@nestjs/common";

import { NodeTypeController } from "./node-type.controller";
import { NodeTypeService } from "./node-type.service";

@Module({
  controllers: [NodeTypeController],
  providers: [NodeTypeService],
  exports: [NodeTypeService],
})
export class NodeTypeModule {}
