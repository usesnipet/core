import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { BaseSchema, MetadataSchema } from "./base";

export class NodeSchema extends BaseSchema {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataSchema)
  metadata?: MetadataSchema;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  config?: string;
}
