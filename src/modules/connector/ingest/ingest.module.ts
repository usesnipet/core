import { randomUUID } from "crypto";
import { diskStorage } from "multer";
import path from "path";

import { env } from "@/env";
import { DatabaseModule } from "@/infra/database/database.module";
import { ProcessorModule } from "@/infra/processor/processor.module";
import { VectorStoreModule } from "@/infra/vector/vector.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { IngestController } from "./ingest.controller";
import { IngestJob } from "./ingest.job";
import { IngestService } from "./ingest.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    BullModule.registerQueue({ name: IngestJob.INGEST_KEY }),
    BullBoardModule.forFeature({ name: IngestJob.INGEST_KEY, adapter: BullMQAdapter }),
    VectorStoreModule,
    ProcessorModule,
    MulterModule.register({
      storage: diskStorage({
        destination: env.FILE_UPLOAD_PATH,
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const id = randomUUID();
          cb(null, id + ext);
        }
      })
    })

  ],
  controllers: [IngestController],
  providers: [IngestService, IngestJob],
  exports: []
})
export class IngestModule {}
