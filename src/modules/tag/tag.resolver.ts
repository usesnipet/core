import { FilterOptions, GraphQLFilterConverter } from "@/common/filter";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";

import { TagArgs } from "./dto/tag.args";
import { Tag } from "./models/tag.model";
import { TagService } from "./tag.service";

import type { GraphQLResolveInfo } from "graphql";

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  @Query(() => [Tag])
  async tags(@Info() info: GraphQLResolveInfo, @Args() args: TagArgs): Promise<Tag[]> {
    return this.tagService.find(new FilterOptions(GraphQLFilterConverter.toFilterOptions(info, args)));
  }
}
