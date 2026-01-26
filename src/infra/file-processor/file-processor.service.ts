import { env } from "@/env";
import { Inject, Injectable } from "@nestjs/common";

import { canonicalize } from "@/lib/canonicalize";
import { File } from "node:buffer";
import { EmbeddingService } from "../embedding/embedding.service";
import { SourceVectorStorePayload } from "../vector/payload/source-vector-store-payload";
import { FileMetadata } from "../vector/payload/vector-store-payload";
import { ExtractionService } from "./extraction/extraction.service";

@Injectable()
export class FileProcessorService {

  @Inject() private readonly extractorService: ExtractionService;
  @Inject() private readonly embeddingService: EmbeddingService;

  async process(
    input: File,
    metadata: FileMetadata,
    knowledgeId: string,
    connectorId?: string,
    externalId?: string
  ): Promise<SourceVectorStorePayload[]> {
    const genericDocument = await this.extractorService.extract(
      env.DEFAULT_EXTRACTOR,
      input,
      metadata,
      env.EXTRACTOR_SETTINGS,
    );

    const payloads = await Promise.all(genericDocument.nodes.map(async ({ id, content, metadata: nodeMetadata }, index) => {
      if (!content) throw new Error('Content cannot be empty');
      const canonicalText = canonicalize(content);
      const { embeddings } = await this.embeddingService.getOrCreateEmbedding(canonicalText);
      return new SourceVectorStorePayload({
        id,
        connectorId,
        knowledgeId,
        externalId,
        content,
        fullContent: content,
        seqId: index,
        dense: embeddings,
        metadata: { ...metadata, ...nodeMetadata },
      });
    }));

    return payloads;
  }
}