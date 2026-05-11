import type { ConfigTagRow } from "@/db/schema/entity-tags";
import { Tag } from "@/modules/tag/models/tag.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ConfigTag {
  @Field(() => ID)
  configId: string;

  @Field(() => ID)
  tagId: string;

  @Field(() => Tag, { nullable: true })
  tag?: Tag;

  constructor(data: ConfigTagRow) {
    Object.assign(this, data);
    this.tag = data.tag ? new Tag(data.tag) : undefined;
  }
}
