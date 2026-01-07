import { Module } from "@nestjs/common";

import { ExtractionService } from "./extraction.service";
import { LangchainModule } from "./langchain/langchain.module";
import { UnstructuredModule } from "./unstructured/unstructured.module";

@Module({
  imports: [LangchainModule, UnstructuredModule],
  providers: [ExtractionService],
  exports: [ExtractionService],
})
export class ExtractionModule {}
