import { JsonObject } from "@/common/graphql/json-object";
import type { NodeTypeRow } from "@/db/schema/node-type";
import { Field, ID, ObjectType } from "@nestjs/graphql";

import { NodeTypeTag } from "./node-type-tag.model";

@ObjectType()
export class NodeType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  typeId: string;

  @Field(() => ID)
  packageId: string;

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

  @Field(() => JsonObject, { nullable: true })
  inputs: Record<string, unknown> | null;

  @Field(() => JsonObject, { nullable: true })
  outputs: Record<string, unknown> | null;

  @Field(() => JsonObject, { nullable: true })
  components: Record<string, unknown> | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [NodeTypeTag], { nullable: true })
  nodeTypeTags: NodeTypeTag[];

  constructor(data: NodeTypeRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.nodeTypeTags = data.nodeTypeTags?.map((t) => new NodeTypeTag(t)) ?? [];
  }
}
