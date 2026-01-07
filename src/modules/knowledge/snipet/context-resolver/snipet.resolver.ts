import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { SnipetMemoryService } from "../memory/snipet-memory.service";

export type SnipetContextResolverOptions = {
  filters?: Record<string, string | number | boolean>;
  lastNMemories?: number;
  query: string | { topK?: number, query: string };
}

@Injectable()
export class SnipetContextResolver {
  @Inject() private readonly snipetMemoryService: SnipetMemoryService;

  resolve(
    knowledgeId: string,
    opts?: SnipetContextResolverOptions
  ): ReturnType<SnipetMemoryService['search']> {
    const query = typeof opts?.query === "string" ? opts.query : opts?.query?.query;
    if (!query) throw new BadRequestException("Query not found");
    return this.snipetMemoryService.search(
      knowledgeId,
      query,
      SnipetMemoryService.withFilters(opts?.filters),
      SnipetMemoryService.withLastNMemories(opts?.lastNMemories),
      SnipetMemoryService.withQuery(opts?.query)
    );
  }
}
