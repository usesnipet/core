import { FilterOptions, GraphQLFilterConverter } from "@/common/filter";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";

import { NodeArgs } from "./dto/node.args";
import { Node } from "./models/node.model";
import { NodeService } from "./node.service";

import type { GraphQLResolveInfo } from "graphql";

@Resolver(() => Node)
export class NodeResolver {
  constructor(private readonly nodeService: NodeService) {}

  @Query(() => [Node])
  async nodes(@Info() info: GraphQLResolveInfo, @Args() args: NodeArgs): Promise<Node[]> {
    return this.nodeService.find(new FilterOptions(GraphQLFilterConverter.toFilterOptions(info, args)));
  }
}
