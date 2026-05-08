import { IsArray, IsOptional, IsString } from "class-validator";

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
  @IsString()
  id!: string;
}
