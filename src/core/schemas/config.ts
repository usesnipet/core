import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { BaseSchema } from "./base";
import { FieldSchema } from "./field";

@ObjectType()
export class ConfigSchema extends BaseSchema {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldSchema)
  @Field(() => [FieldSchema], { nullable: true })
  fields?: FieldSchema[];
}
