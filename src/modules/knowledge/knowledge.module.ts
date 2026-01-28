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
import { KnowledgeAssetController } from "./knowledge-asset.controller";
import { FILE_INGEST_QUEUE } from "./file-ingest.constants";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    EmbeddingModule,
    VectorStoreModule,
    FileProcessorModule,
    ApiKeyModule,
    BullModule.registerQueue({ name: FILE_INGEST_QUEUE }),
    BullBoardModule.forFeature({ name: FILE_INGEST_QUEUE, adapter: BullMQAdapter }),
    MulterModule.register({ storage: memoryStorage() }),
    StorageModule.register()
  ],
  controllers: [KnowledgeController, KnowledgeAssetController],
  providers: [KnowledgeService, FileIngestJob, KnowledgeAssetService],
  exports: [KnowledgeService, KnowledgeAssetService]
})
export class KnowledgeModule {}
