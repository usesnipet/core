import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";
import { ExtractedDocument } from "../../interfaces/extracted-document";

@Injectable()
export class LangchainDocxLoader extends BaseLoader {
  async process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument> {
    const loader = new DocxLoader(blob, { 
      type: metadata.extension === "doc" ? "doc" : "docx" 
    });
    const docs = await loader.load();
    const nodes = this.createDocumentNodes(docs, metadata);
    return this.createDocument(nodes, {
      ...metadata,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
}