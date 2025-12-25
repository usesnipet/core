import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { Injectable } from "@nestjs/common";
import { BaseLoader } from "./base.loader";
import { ExtractedDocument } from "../../interfaces/extracted-document";

@Injectable()
export class LangchainCSVLoader extends BaseLoader {
  async process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument> {
    const loader = new CSVLoader(blob, { column: 'text' });
    const docs = await loader.load();
    const nodes = this.createDocumentNodes(docs, metadata);
    return this.createDocument(nodes, {
      ...metadata,
      fileType: 'text/csv',
    });
  }
}