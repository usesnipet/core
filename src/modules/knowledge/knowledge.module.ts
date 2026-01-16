import { memoryStorage } from "multer";

import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { KnowledgeController } from "./knowledge.controller";
import { KnowledgeService } from "./knowledge.service";
import { EmbeddingModule } from "@/infra/embedding/embedding.module";
import { VectorStoreModule } from "@/infra/vector/vector.module";
import { ApiKeyModule } from "../api-key/api-key.module";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FileIngestJob } from "./file-ingest.job";
import { FileProcessorModule } from "@/infra/file-processor/file-processor.module";
import { MulterModule } from "@nestjs/platform-express";
import { StorageModule } from "@/infra/storage/storage.module";
import { KnowledgeAssetService } from "./knowledge-asset.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    EmbeddingModule,
    VectorStoreModule,
    FileProcessorModule,
    ApiKeyModule,
    BullModule.registerQueue({ name: FileIngestJob.INGEST_KEY }),
    BullBoardModule.forFeature({ name: FileIngestJob.INGEST_KEY, adapter: BullMQAdapter }),
    MulterModule.register({ storage: memoryStorage() }),
    StorageModule.register()
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, FileIngestJob, KnowledgeAssetService],
  exports: [KnowledgeService]
})
export class KnowledgeModule {}
