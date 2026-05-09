import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

import { PackageDto } from "./package.dto";

export class UpdatePackageDto extends PartialType(OmitType(PackageDto, ["id", "packageTags","createdAt", "updatedAt"] as const)) {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];


  constructor(data: UpdatePackageDto) {
    super();
    Object.assign(this, data);
  }
}

