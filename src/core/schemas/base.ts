import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

@ObjectType()
export class MetadataSchema {
  @IsString()
  @Field(() => String)
  name!: string;

  @IsString()
  @Field(() => String)
  description!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  docs?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  icon?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  author?: string;
}

@ObjectType()
export class BaseSchema {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataSchema)
  @Field(() => MetadataSchema)
  metadata: MetadataSchema;

  @IsString()
  @Field(() => String)
  id!: string;
}
