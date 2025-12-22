import { Fragments, SourceFragment } from "@/fragment";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

type CreateFragmentOptions = {
  connectorId: string;
  knowledgeId: string;
  metadata: any;
}

export abstract class BaseLoader {
  protected splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
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

