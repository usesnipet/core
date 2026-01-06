import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { KnowledgeController } from "./knowledge.controller";
import { KnowledgeService } from "./knowledge.service";
import { EmbeddingModule } from "@/infra/embedding/embedding.module";
import { VectorStoreModule } from "@/infra/vector/vector.module";
import { ApiKeyModule } from "../api-key/api-key.module";

@Module({
  imports: [HTTPContextModule, DatabaseModule, EmbeddingModule, VectorStoreModule, ApiKeyModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService]
})
export class KnowledgeModule {}
