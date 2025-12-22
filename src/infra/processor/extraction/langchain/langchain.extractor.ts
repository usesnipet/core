
import { Inject, Injectable, Logger } from "@nestjs/common";

import { DocumentExtractor } from "../interfaces/document-extractor";
import { ExtractedDocument } from "../interfaces/extracted-document";

import {
  LangchainCSVLoader, LangchainDocxLoader, LangchainJSONLLoader, LangchainJSONLoader, LangchainPDFLoader,
  LangchainPPTXLoader, LangchainTextLoader
} from "./loaders";
import { BaseLoader } from "./loaders/base.loader";

@Injectable()
export class LangchainExtractor implements DocumentExtractor {
  readonly name = 'langchain';
  readonly supportedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'application/json',
    'application/jsonl',
    'text/markdown',
  ];

  private readonly logger = new Logger(LangchainExtractor.name);

  @Inject() private readonly pdfProcessor!: LangchainPDFLoader;
  @Inject() private readonly docxProcessor!: LangchainDocxLoader;
  @Inject() private readonly pptProcessor!: LangchainPPTXLoader;
  @Inject() private readonly textProcessor!: LangchainTextLoader;
  @Inject() private readonly csvProcessor!: LangchainCSVLoader;
  @Inject() private readonly jsonProcessor!: LangchainJSONLoader;
  @Inject() private readonly jsonlProcessor!: LangchainJSONLLoader;

  private getProcessor(extension: string): BaseLoader {
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

  extract(
    input: string | Blob,
    metadata: Record<string, any>,
    options?: Record<string, any>
  ): Promise<ExtractedDocument> {
    let blob: Blob;
    if (typeof input === 'string') {
      blob = new Blob([input], { type: 'text/plain' });
    } else if (input instanceof Blob) {
      blob = input;
    } else {
      blob = new Blob([input]);
    }
    // const processor = this.getProcessor(metadata.extension);
    throw new Error('Not implemented');

  }
}
