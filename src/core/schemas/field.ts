import { JsonObject } from "@/common/graphql/json-object";
import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsAlphanumeric, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested
} from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

@ObjectType()
export class FieldSchema {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 30)
  @Field(() => String)
  name!: string;

  @IsString()
  @Field(() => String)
  type!: string;

  @IsString()
  @Field(() => String)
  description!: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  required?: boolean;

  @IsOptional()
  @Field(() => JsonObject, { nullable: true })
  defaultValue?: unknown;

  @IsOptional()
  @ValidateNested()
  @Type(() => FieldSchema)
  @Field(() => JsonObject, { nullable: true })
  items?: FieldSchema;

  @IsOptional()
  @IsRecordOf(FieldSchema)
  @Field(() => [JsonObject], { nullable: true })
  properties?: Record<string, FieldSchema>;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  encrypted?: boolean;
}