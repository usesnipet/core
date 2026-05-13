import { JsonObject } from "@/common/graphql/json-object";
import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { BaseSchema } from "./base";
import { FieldSchema } from "./field";

@ObjectType()
export class NodeTypeComponentSchema {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  @Field(() => String)
  name!: string;

  @IsString()
  @Field(() => String)
  type!: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  required?: boolean;
}

@ObjectType()
export class NodeTypeSchema extends BaseSchema {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldSchema)
  @Field(() => [JsonObject], { nullable: true })
  inputs?: FieldSchema[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldSchema)
  @Field(() => [JsonObject], { nullable: true })
  outputs?: FieldSchema[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeComponentSchema)
  @Field(() => [JsonObject], { nullable: true })
  components?: NodeTypeComponentSchema[];
}