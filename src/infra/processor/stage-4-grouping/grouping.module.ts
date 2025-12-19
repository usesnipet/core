import { Module } from "@nestjs/common";

import { GroupingService } from "./grouping.service";

@Module({
  providers: [GroupingService],
  exports: [GroupingService],
})
export class GroupingModule {}
