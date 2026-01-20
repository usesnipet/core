import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";
import { ExtractedDocument } from "../../interfaces/extracted-document";

@Injectable()
export class LangchainPPTXLoader extends BaseLoader {
  async process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument> {
    const loader = new PPTXLoader(blob);
    const docs = await loader.load();
    const nodes = this.createDocumentNodes(docs, metadata);
    return this.createDocument(nodes, {
      ...metadata,
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
  }
}