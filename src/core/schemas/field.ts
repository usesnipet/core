import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

import { IsRecordOf } from "../../validation/decorators/is-record-of";

export class Field {
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
  @Type(() => Field)
  items?: Field;

  @IsOptional()
  @IsRecordOf(Field)
  @Type(() => Field)
  properties?: Record<string, Field>;

  @IsOptional()
  @IsBoolean()
  encrypted?: boolean;
}