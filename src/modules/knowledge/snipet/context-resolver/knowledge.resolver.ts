import { Inject, Injectable } from "@nestjs/common";
import { KnowledgeService } from "../../knowledge.service";
import { SourceVectorStorePayload } from "@/infra/vector/payload/source-vector-store-payload";
export type SnipetContextResolverOptions = {
  metadata?: Record<string, any>;
  filters?: Record<string, string | number | boolean>;
  topK?: number;
}
@Injectable()
export class KnowledgeContextResolver {
  @Inject() private readonly knowledgeService: KnowledgeService;

  resolve(
    knowledgeId: string,
    query: string,
    opts?: SnipetContextResolverOptions
  ): Promise<SourceVectorStorePayload[]> {
    return this.knowledgeService.search(
      knowledgeId,
      query,
      KnowledgeService.withTopK(opts?.topK ?? 10),
      KnowledgeService.withMetadata(opts?.metadata),
      KnowledgeService.withFilters(opts?.filters),
    );
  }
}
