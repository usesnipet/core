import { Module } from "@nestjs/common";

import { FlowResolver } from "./flow.resolver";
import { FlowService } from "./flow.service";

@Module({
  providers: [FlowService, FlowResolver],
  exports: [FlowService],
})
export class FlowModule {}