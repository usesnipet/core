import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

import { BaseSchema, MetadataSchema } from "./base";
import { FieldSchema } from "./field";

export class NodeTypeComponentSchema {
  @IsString()
  type!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class NodeTypeSchema extends BaseSchema {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataSchema)
  metadata?: MetadataSchema;

  @IsOptional()
  @IsRecordOf(FieldSchema)
  inputs?: Record<string, FieldSchema>;

  @IsOptional()
  @IsRecordOf(FieldSchema)
  outputs?: Record<string, FieldSchema>;

  @IsOptional()
  @IsRecordOf(NodeTypeComponentSchema)
  components?: Record<string, NodeTypeComponentSchema>;

  @IsOptional()
  @IsString()
  category?: string;
}