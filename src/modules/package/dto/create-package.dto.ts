import { ApiProperty, OmitType } from "@nestjs/swagger";
import { PackageEntity } from "../package.entity";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreatePackageDto extends OmitType(PackageEntity, ["id", "createdAt", "updatedAt"] as const) {
  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];
}

