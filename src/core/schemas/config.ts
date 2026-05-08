import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

import { BaseSchema, MetadataSchema } from "./base";
import { FieldSchema } from "./field";

export class ConfigSchema extends BaseSchema {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataSchema)
  metadata?: MetadataSchema;

  @IsRecordOf(FieldSchema)
  @Type(() => FieldSchema)
  fields!: Record<string, FieldSchema>;
}
