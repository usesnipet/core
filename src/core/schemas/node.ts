import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

import { BaseSchema } from "./base";

@ObjectType()
export class NodeSchema extends BaseSchema {
  @IsString()
  @Field(() => String)
  type!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  config?: string;
}
