import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";
import { ExtractedDocument } from "../../interfaces/extracted-document";
@Injectable()
export class LangchainPDFLoader extends BaseLoader {
  async process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument> {
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    const nodes = this.createDocumentNodes(docs, metadata);
    return this.createDocument(nodes, {
      ...metadata,
      fileType: 'application/pdf',
    });
  }
}