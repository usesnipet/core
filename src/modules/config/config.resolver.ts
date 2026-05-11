import { FilterOptions, GraphQLFilterConverter } from "@/common/filter";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";

import { ConfigService } from "./config.service";
import { ConfigArgs } from "./dto/config.args";
import { Config } from "./models/config.model";

import type { GraphQLResolveInfo } from "graphql";

@Resolver(() => Config)
export class ConfigResolver {
  constructor(private readonly configService: ConfigService) {}

  @Query(() => [Config])
  async configs(@Info() info: GraphQLResolveInfo, @Args() args: ConfigArgs): Promise<Config[]> {
    return this.configService.find(
      new FilterOptions(GraphQLFilterConverter.toFilterOptions(info, args)),
    );
  }
}
