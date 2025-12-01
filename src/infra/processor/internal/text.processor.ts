import { Injectable } from '@nestjs/common';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { BaseProcessor } from '../base.processor';
import { Fragments, SourceFragment } from '@/fragment';

@Injectable()
export class TextProcessor extends BaseProcessor {
  async process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    const loader = new TextLoader(pathOrBlob);
    const docs = await loader.load();
    const chunks = await this.splitter.splitDocuments(docs);
    return this.createFragments(chunks, { connectorId, knowledgeId, metadata });
  }
}
