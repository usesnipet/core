import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { FileController } from "./file.controller";
import { FileService } from "./file.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: []
})
export class FileModule {}
