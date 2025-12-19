import { Fragments, SourceFragment } from "@/fragment";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";

@Injectable()
export class LangchainPPTXLoader extends BaseLoader {
  async process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    const loader = new PPTXLoader(pathOrBlob);
    const docs = await loader.load();
    const chunks = await this.splitter.splitDocuments(docs);
    return this.createFragments(chunks, { connectorId, knowledgeId, metadata });
  }
}
