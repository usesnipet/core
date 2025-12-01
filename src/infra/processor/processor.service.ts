import { Fragments, SourceFragment } from "@/fragment";
import { Inject, Injectable, Logger } from "@nestjs/common";

import { BaseProcessor } from "./base.processor";
import {
  CSVProcessor, DocxProcessor, JSONLProcessor, JSONProcessor, PDFProcessor, PPTProcessor,
  TextProcessor
} from "./internal";

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  @Inject() private readonly pdfProcessor!: PDFProcessor;
  @Inject() private readonly docxProcessor!: DocxProcessor;
  @Inject() private readonly pptProcessor!: PPTProcessor;
  @Inject() private readonly textProcessor!: TextProcessor;
  @Inject() private readonly csvProcessor!: CSVProcessor;
  @Inject() private readonly jsonProcessor!: JSONProcessor;
  @Inject() private readonly jsonlProcessor!: JSONLProcessor;

  private getProcessor(extension: string): BaseProcessor {
    const ext = extension.toLowerCase();

    if (['pdf'].includes(ext)) return this.pdfProcessor;
    if (['doc', 'docx'].includes(ext)) return this.docxProcessor;
    if (['ppt', 'pptx'].includes(ext)) return this.pptProcessor;
    if (['txt', 'md', 'log'].includes(ext)) return this.textProcessor;
    if (['csv'].includes(ext)) return this.csvProcessor;
    if (['json'].includes(ext)) return this.jsonProcessor;
    if (['jsonl', 'ndjson'].includes(ext)) return this.jsonlProcessor;

    throw new Error(`Unsupported file extension: ${extension}`);
  }

  async process(
    connectorId: string,
    knowledgeId: string,
    input: Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    const processor = this.getProcessor(metadata.extension);
    this.logger.debug(`Processing file "${metadata.name}" with ${processor.constructor.name}`);
    return processor.process(connectorId, knowledgeId, input, metadata);
  }
}
