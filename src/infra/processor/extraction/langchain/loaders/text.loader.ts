import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { Injectable } from "@nestjs/common";
import { BaseLoader } from "./base.loader";
import { ExtractedDocument } from "../../interfaces/extracted-document";

@Injectable()
export class LangchainTextLoader extends BaseLoader {
  async process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument> {
    const loader = new TextLoader(blob);
    const docs = await loader.load();
    const nodes = this.createDocumentNodes(docs, metadata);
    return this.createDocument(nodes, {
      ...metadata,
      fileType: 'text/plain',
    });
  }
}