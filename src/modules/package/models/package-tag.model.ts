import type { PackageTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/models/tag.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PackageTag {
  @Field(type => ID)
  packageId: string;

  @Field(type => ID)
  tagId: string;

  @Field(type => Tag, { nullable: true })
  tag?: Tag;

  constructor(data: PackageTagRow) {
    Object.assign(this, data);

    this.tag = data.tag ? new Tag(data.tag) : undefined;
  }
}