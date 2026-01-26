import { Inject, Injectable } from "@nestjs/common";

import { File } from "node:buffer";
import { ExtractedDocument } from "./interfaces/extracted-document";
import { LangchainExtractor } from "./langchain/langchain.extractor";
import { UnstructuredExtractor } from "./unstructured/unstructured.extractor";

@Injectable()
export class ExtractionService {
  @Inject() private readonly unstructuredExtractor: UnstructuredExtractor;
  @Inject() private readonly langchainExtractor: LangchainExtractor;

  extract(
    extractor: string,
    input: File,
    metadata: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<ExtractedDocument> {
    if (extractor === "unstructured") {
      return this.unstructuredExtractor.extract(input, metadata, options);
    }
    if (extractor === "langchain") {
      return this.langchainExtractor.extract(input, metadata);
    }
    throw new Error(`Unknown extractor: ${extractor}`);
  }
}