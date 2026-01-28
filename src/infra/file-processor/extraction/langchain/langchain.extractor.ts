
import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { DocumentExtractor } from "../interfaces/document-extractor";
import { ExtractedDocument } from "../interfaces/extracted-document";

import { fileToBlob } from "@/utils/file-to-blob";
import { File } from "node:buffer";
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


  @Inject() private readonly pdfProcessor!: LangchainPDFLoader;
  @Inject() private readonly docxProcessor!: LangchainDocxLoader;
  @Inject() private readonly pptProcessor!: LangchainPPTXLoader;
  @Inject() private readonly textProcessor!: LangchainTextLoader;
  @Inject() private readonly csvProcessor!: LangchainCSVLoader;
  @Inject() private readonly jsonProcessor!: LangchainJSONLoader;
  @Inject() private readonly jsonlProcessor!: LangchainJSONLLoader;

  private getLoader(extension: string): BaseLoader {
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

  async extract(input: File, metadata: Record<string, any>): Promise<ExtractedDocument> {
    const extension = input.name.split('.').pop();
    if (!extension) throw new BadRequestException('File extension not found');
    const loader = this.getLoader(extension);
    return loader.process(await fileToBlob(input), metadata);
  }
}
