import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { PackageTagDto } from "./package-tag.dto";

export class PackageDto {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, nullable: true, required: false })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  @IsOptional()
  @IsString()
  docs: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  @IsOptional()
  @IsString()
  icon: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  @IsOptional()
  @IsString()
  author: string | null;

  @ApiProperty({ type: Date })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ type: Date })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({ type: () => [PackageTagDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageTagDto)
  packageTags?: PackageTagDto[];

  constructor(data: PackageDto) {
    Object.assign(this, data);
  }
}
