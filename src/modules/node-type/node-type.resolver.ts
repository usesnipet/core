import { FilterOptions, GraphQLFilterConverter } from "@/common/filter";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";

import { NodeTypeArgs } from "./dto/node-type.args";
import { NodeType } from "./models/node-type.model";
import { NodeTypeService } from "./node-type.service";

import type { GraphQLResolveInfo } from "graphql";

@Resolver(() => NodeType)
export class NodeTypeResolver {
  constructor(private readonly nodeTypeService: NodeTypeService) {}

  @Query(() => [NodeType])
  async nodeTypes(@Info() info: GraphQLResolveInfo, @Args() args: NodeTypeArgs): Promise<NodeType[]> {
    return this.nodeTypeService.find(
      new FilterOptions(GraphQLFilterConverter.toFilterOptions(info, args)),
    );
  }
}
