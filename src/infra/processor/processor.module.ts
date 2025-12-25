import { Module } from "@nestjs/common";

import { ExtractionModule } from "./extraction/extraction.module";
import { EmbeddingModule } from "../embedding/embedding.module";
import { ProcessorService } from "./processor.service";

@Module({
  imports: [ExtractionModule, EmbeddingModule],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}