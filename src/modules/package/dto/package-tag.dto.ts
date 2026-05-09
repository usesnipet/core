import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { TagDto } from "../../tag/dto/tag.dto";

import { PackageDto } from "./package.dto";

export class PackageTagDto {
  @ApiProperty({ description: "The ID of the package" })
  @IsString()
  packageId: string;

  @ApiProperty({ description: "The ID of the tag" })
  @IsString()
  tagId: string;

  @IsOptional()
  @ApiProperty({ type: () => TagDto, description: "Tag metadata" })
  @ValidateNested()
  @Type(() => TagDto)
  tag?: TagDto;

  @IsOptional()
  @ApiProperty({ type: () => PackageDto, description: "Package metadata" })
  @ValidateNested()
  @Type(() => PackageDto)
  package?: PackageDto;

  constructor(data: PackageTagDto) {
    Object.assign(this, data);
  }
}