import { Module } from "@nestjs/common";

import {
  CSVProcessor, DocxProcessor, JSONLProcessor, JSONProcessor, PDFProcessor, PPTProcessor,
  TextProcessor
} from "./internal";
import { ProcessorService } from "./processor.service";

@Module({
  providers: [
    ProcessorService,
    CSVProcessor,
    DocxProcessor,
    JSONProcessor,
    JSONLProcessor,
    PDFProcessor,
    PPTProcessor,
    TextProcessor
  ],
  exports: [ ProcessorService ],
})
export class ProcessorModule {}