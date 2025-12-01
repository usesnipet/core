import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Fragments, SourceFragment } from '@/fragment';

type CreateFragmentOptions = {
  connectorId: string;
  knowledgeId: string;
  metadata: any;
}

export abstract class BaseProcessor {
  protected splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  protected createFragments(
    docs: { pageContent: string }[],
    { connectorId, knowledgeId , metadata }: CreateFragmentOptions,
  ): Fragments<SourceFragment> {
    const fragmentsArray = docs.map(({ pageContent }, seqId) => {
      return new SourceFragment({
        content: pageContent,
        connectorId,
        knowledgeId,
        seqId,
        metadata,
      });
    });

    return Fragments.fromFragmentArray(fragmentsArray);
  }

  abstract process(
    connectorId: string,
    knowledgeId: string,
    pathOrBlob: string | Blob,
    metadata: Record<string, any>
  ): Promise<Fragments<SourceFragment>>;
}

