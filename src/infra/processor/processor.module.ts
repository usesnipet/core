import { Module } from "@nestjs/common";

import { ExtractionModule } from "./extraction/extraction.module";
import { ProcessorService } from "./processor.service";

@Module({
  imports: [ExtractionModule],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}