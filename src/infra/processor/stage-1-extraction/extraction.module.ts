import { Module } from "@nestjs/common";

import { ExtractionService } from "./extraction.service";
import { LangchainExtractor } from "./langchain/langchain.extractor";
import { UnstructuredExtractor } from "./unstructured/unstructured.extractor";

@Module({
  providers: [ExtractionService, UnstructuredExtractor, LangchainExtractor],
  exports: [ExtractionService],
})
export class ExtractionModule {}
