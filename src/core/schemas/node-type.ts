import { IsBoolean, IsOptional, IsString } from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

import { BaseSchema } from "./base";
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
  @IsRecordOf(FieldSchema)
  inputs?: Record<string, FieldSchema>;

  @IsOptional()
  @IsRecordOf(FieldSchema)
  outputs?: Record<string, FieldSchema>;

  @IsOptional()
  @IsRecordOf(NodeTypeComponentSchema)
  components?: Record<string, NodeTypeComponentSchema>;
}