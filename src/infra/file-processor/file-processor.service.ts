import { env } from "@/env";
import { Inject, Injectable } from "@nestjs/common";

import { canonicalize } from "@/lib/canonicalize";
import { KnowledgeAssetEntity } from "@/modules/knowledge/asset/knowledge-asset.entity";
import { File } from "node:buffer";
import { EmbeddingService } from "../embedding/embedding.service";
import { SourceVectorStorePayload } from "../vector/payload/source-vector-store-payload";
import { ExtractionService } from "./extraction/extraction.service";

@Injectable()
export class FileProcessorService {

  @Inject() private readonly extractorService: ExtractionService;
  @Inject() private readonly embeddingService: EmbeddingService;

  async process(
    file: File,
    knowledgeAsset: KnowledgeAssetEntity,
  ): Promise<SourceVectorStorePayload[]> {
    const genericDocument = await this.extractorService.extract(
      env.DEFAULT_EXTRACTOR,
      file,
      knowledgeAsset.metadata ?? {},
      env.EXTRACTOR_SETTINGS,
    );

    const payloads = await Promise.all(genericDocument.nodes.map(async ({ id, content, metadata: nodeMetadata }, index) => {
      if (!content) throw new Error('Content cannot be empty');
      const canonicalText = canonicalize(content);
      const { data } = await this.embeddingService.getOrCreateEmbedding(canonicalText);
      return new SourceVectorStorePayload({
        id,
        connectorId: knowledgeAsset.connectorId,
        knowledgeId: knowledgeAsset.knowledgeId,
        externalId: knowledgeAsset.externalId,
        content,
        fullContent: content,
        seqId: index,
        dense: data.embeddings,
        metadata: {
          type: "file",
          fileMetadata: knowledgeAsset.metadata ?? {},
          mimeType: knowledgeAsset.content?.mimeType?? "",
          originalName: knowledgeAsset.content?.text?? "",
          size: knowledgeAsset.content?.sizeBytes?? 0,
          ...nodeMetadata
        },
      });
    }));

    return payloads;
  }
}