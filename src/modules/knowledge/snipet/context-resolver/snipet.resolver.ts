import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { SnipetAssetService } from "../assets/snipet-asset.service";

export type SnipetContextResolverOptions = {
  filters?: Record<string, string | number | boolean>;
  lastNMemories?: number;
  query: string | { topK?: number, query: string };
}

@Injectable()
export class SnipetContextResolver {
  @Inject() private readonly snipetMemoryService: SnipetAssetService;

  resolve(
    knowledgeId: string,
    opts?: SnipetContextResolverOptions
  ): ReturnType<SnipetAssetService['search']> {
    const query = typeof opts?.query === "string" ? opts.query : opts?.query?.query;
    if (!query) throw new BadRequestException("Query not found");
    return this.snipetMemoryService.search(
      knowledgeId,
      query,
      SnipetAssetService.withFilters(opts?.filters),
      SnipetAssetService.withLastNMemories(opts?.lastNMemories),
      SnipetAssetService.withQuery(opts?.query)
    );
  }
}
