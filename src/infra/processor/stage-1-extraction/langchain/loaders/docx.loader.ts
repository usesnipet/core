import { Fragments, SourceFragment } from "@/fragment";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";

@Injectable()
export class LangchainDocxLoader extends BaseLoader {
  async process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    const loader = new DocxLoader(pathOrBlob, { type: metadata.extension === "doc" ? "doc" : "docx" });
    const docs = await loader.load();
    const chunks = await this.splitter.splitDocuments(docs);
    return this.createFragments(chunks, { connectorId, knowledgeId, metadata });
  }
}
