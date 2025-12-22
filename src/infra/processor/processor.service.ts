import { env } from "@/env";
import { Fragments, SourceFragment } from "@/fragment";
import { Inject, Injectable } from "@nestjs/common";

import { ExtractionService } from "./extraction/extraction.service";

@Injectable()
export class ProcessorService {
  @Inject() private readonly extractorService: ExtractionService;

  async process(blob: Blob, metadata: Record<string, any>): Promise<Fragments<SourceFragment>> {
    const genericDocument = await this.extractorService.extract(
      env.DEFAULT_EXTRACTOR,
      blob,
      metadata,
      env.EXTRACTOR_SETTINGS,
    );

    return Fragments.fromFragmentArray(
      genericDocument.nodes.filter(node => !!node.content).map((node, seqId) => (new SourceFragment({
      connectorId: metadata.connectorId,
      knowledgeId: metadata.knowledgeId,
      seqId,
      metadata,
      content: node.content!,
    }))));
  }
}