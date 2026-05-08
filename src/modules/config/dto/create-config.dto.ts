import { ApiProperty, OmitType } from "@nestjs/swagger";
import { ConfigEntity } from "../config.entity";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateConfigDto extends OmitType(ConfigEntity, ["id", "createdAt", "updatedAt"] as const) {
  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];
}

