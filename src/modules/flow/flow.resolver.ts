import { FilterOptions, GraphQLFilterConverter } from "@/common/filter";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";

import { FlowArgs } from "./dto/flow.args";
import { FlowService } from "./flow.service";
import { Flow } from "./model/flow.model";

import type { GraphQLResolveInfo } from "graphql";

@Resolver(() => Flow)
export class FlowResolver {
  constructor(private readonly FlowService: FlowService) {}

  @Query(() => [Flow])
  async Flows(@Info() info: GraphQLResolveInfo, @Args() args: FlowArgs): Promise<Flow[]> {
    return this.FlowService.find(new FilterOptions(GraphQLFilterConverter.toFilterOptions(info, args)));
  }
}
