import { FilterOptions, GraphQLFilterConverter } from "@/common/filter";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";

import { PackageArgs } from "./dto/package.args";
import { Package } from "./models/package.model";
import { PackageService } from "./package.service";

import type { GraphQLResolveInfo } from "graphql";

@Resolver(() => Package)
export class PackageResolver {
  constructor(private readonly packageService: PackageService) {}

  @Query(() => [Package])
  async packages(@Info() info: GraphQLResolveInfo, @Args() args: PackageArgs): Promise<Package[]> {
    return this.packageService.find(
      new FilterOptions(GraphQLFilterConverter.toFilterOptions(info, args)),
    );
  }
}