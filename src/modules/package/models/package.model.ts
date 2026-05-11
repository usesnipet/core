import { Field, ID, ObjectType } from "@nestjs/graphql";

import { PackageTag } from "./package-tag.model";

import type { PackageRow } from "@/db/schema/package";

@ObjectType()
export class Package {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  packageId: string;

  @Field(() => String)
  version: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  docs: string | null;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => String, { nullable: true })
  author: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [PackageTag], { nullable: true })
  packageTags: PackageTag[];

  constructor(data: PackageRow) {
    Object.assign(this, data);

    this.packageTags = data.packageTags?.map((t) => new PackageTag(t)) ?? [];
  }
}