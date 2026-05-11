import type { TagRow } from "@/db/schema/tag";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Tag {
  @Field(type => ID)
  id: string;

  @Field(() => String)
  name: string;

  constructor(data: TagRow) {
    Object.assign(this, data);
  }
}