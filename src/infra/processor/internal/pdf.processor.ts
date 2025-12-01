import { Injectable } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { BaseProcessor } from '../base.processor';
import { Fragments, SourceFragment } from '@/fragment';

@Injectable()
export class PDFProcessor extends BaseProcessor {
  async process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    const loader = new PDFLoader(pathOrBlob, { splitPages: false });
    const docs = await loader.load();
    const chunks = await this.splitter.splitDocuments(docs);
    return this.createFragments(chunks, { connectorId, knowledgeId, metadata });
  }
}
