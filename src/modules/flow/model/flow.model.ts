import { FlowSchema } from "@/core/schemas/flow";
import { Field, ID, ObjectType } from "@nestjs/graphql";

import type { FlowRow } from "@/db/schema/flow";
@ObjectType()
export class Flow {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean)
  active: boolean;

  @Field(() => FlowSchema)
  code: FlowSchema;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  constructor(data: FlowRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
  }
}