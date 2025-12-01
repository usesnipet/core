import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { KnowledgeController } from "./knowledge.controller";
import { KnowledgeService } from "./knowledge.service";

@Module({
  imports: [HTTPContextModule, DatabaseModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: []
})
export class KnowledgeModule {}
