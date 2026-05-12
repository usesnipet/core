import type { NodeRow } from "@/db/schema/node";
import { Config } from "@/modules/config/models/config.model";
import { NodeType } from "@/modules/node-type/models/node-type.model";
import { Package } from "@/modules/package/models/package.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";

import { NodeTag } from "./node-tag.model";

@ObjectType()
export class Node {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  nodeId: string;

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

  @Field(() => ID)
  nodeTypeId: string;

  @Field(() => ID, { nullable: true })
  configId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [NodeTag], { nullable: true })
  nodeTags: NodeTag[];

  @Field(() => Package, { nullable: true })
  package?: Package;

  @Field(() => NodeType, { nullable: true })
  nodeType?: NodeType;

  @Field(() => Config, { nullable: true })
  config?: Config;

  constructor(data: NodeRow) {
    Object.assign(this, data);
    this.createdAt = typeof data.createdAt === "string" ? new Date(data.createdAt) : (data.createdAt as Date);
    this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : (data.updatedAt as Date);
    this.nodeTags = data.nodeTags?.map((t) => new NodeTag(t)) ?? [];
  }
}
