import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

export class FieldSchema {
  @IsString()
  type!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  defaultValue?: unknown;

  @IsOptional()
  @ValidateNested()
  @Type(() => FieldSchema)
  items?: FieldSchema;

  @IsOptional()
  @IsRecordOf(FieldSchema)
  @Type(() => FieldSchema)
  properties?: Record<string, FieldSchema>;

  @IsOptional()
  @IsBoolean()
  encrypted?: boolean;
}