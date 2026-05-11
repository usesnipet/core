import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class MetadataSchema {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  docs?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  author?: string;
}

export class BaseSchema {

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataSchema)
  metadata: MetadataSchema;

  @IsString()
  id!: string;
}
