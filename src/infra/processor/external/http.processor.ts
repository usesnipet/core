import { Injectable } from '@nestjs/common';
import { Fragments, SourceFragment } from '@/fragment';
import { BaseProcessor } from '../base.processor';

@Injectable()
export class HTTPExternalProcessor extends BaseProcessor {
  async process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>,
  ): Promise<Fragments<SourceFragment>> {
    throw new Error('Method not implemented.');
  }
}
