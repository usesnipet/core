import { Module } from "@nestjs/common";

import { UnstructuredExtractor } from "./unstructured.extractor";

@Module({
  providers: [UnstructuredExtractor],
  exports: [UnstructuredExtractor],
})
export class UnstructuredModule {}