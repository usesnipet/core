import { env } from "@/env";
import { Inject, Injectable } from "@nestjs/common";

import { ExtractionService } from "./extraction/extraction.service";
import { SourceVectorStorePayload } from "../vector/payload/source-vector-store-payload";
import { EmbeddingService } from "../embedding/embedding.service";
import { canonicalize } from "@/lib/canonicalize";
import { FileMetadata } from "../vector/payload/vector-store-payload";

@Injectable()
export class FileProcessorService {

  @Inject() private readonly extractorService: ExtractionService;
  @Inject() private readonly embeddingService: EmbeddingService;

  async process(
    blob: Blob,
    metadata: FileMetadata,
    knowledgeId: string,
    connectorId?: string,
    externalId?: string
  ): Promise<SourceVectorStorePayload[]> {
    const genericDocument = await this.extractorService.extract(
      env.DEFAULT_EXTRACTOR,
      blob,
      metadata,
      env.EXTRACTOR_SETTINGS,
    );

    const payloads = await Promise.all(genericDocument.nodes.map(async ({ id, content, metadata: nodeMetadata }, index) => {
      if (!content) throw new Error('Content cannot be empty');
      const canonicalText = canonicalize(content);
      const { data } = await this.embeddingService.getOrCreateEmbedding(canonicalText);
      return new SourceVectorStorePayload({
        id,
        connectorId,
        knowledgeId,
        externalId,
        content,
        fullContent: content,
        seqId: index,
        dense: data.embeddings,
        metadata: { ...metadata, ...nodeMetadata },
      });
    }));

    return payloads;
  }
}