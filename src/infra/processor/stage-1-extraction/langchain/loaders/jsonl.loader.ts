import { Fragments, SourceFragment } from "@/fragment";
import { JSONLinesLoader } from "@langchain/classic/document_loaders/fs/json";
import { Injectable } from "@nestjs/common";

import { BaseLoader } from "./base.loader";

@Injectable()
export class LangchainJSONLLoader extends BaseLoader {
  async process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    const loader = new JSONLinesLoader(pathOrBlob, "text");
    const docs = await loader.load();
    const chunks = await this.splitter.splitDocuments(docs);
    return this.createFragments(chunks, { connectorId, knowledgeId, metadata });
  }
}
