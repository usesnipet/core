import { Module } from "@nestjs/common";

import { ExtractionModule } from "./extraction/extraction.module";
import { EmbeddingModule } from "../embedding/embedding.module";
import { FileProcessorService } from "./file-processor.service";

@Module({
  imports: [ExtractionModule, EmbeddingModule],
  providers: [FileProcessorService],
  exports: [FileProcessorService],
})
export class FileProcessorModule {}