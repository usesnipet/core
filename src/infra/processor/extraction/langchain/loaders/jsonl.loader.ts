import { JSONLinesLoader } from "@langchain/classic/document_loaders/fs/json";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";
import { ExtractedDocument } from "../../interfaces/extracted-document";

@Injectable()
export class LangchainJSONLLoader extends BaseLoader {
  async process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument> {
    const loader = new JSONLinesLoader(blob, "text");
    const docs = await loader.load();
    const nodes = this.createDocumentNodes(docs, metadata);
    return this.createDocument(nodes, {
      ...metadata,
      fileType: 'application/jsonl',
    });
  }
}