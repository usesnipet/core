import { Injectable } from '@nestjs/common';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { BaseProcessor } from '../base.processor';
import { Fragments, SourceFragment } from '@/fragment';

@Injectable()
export class DocxProcessor extends BaseProcessor {
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
