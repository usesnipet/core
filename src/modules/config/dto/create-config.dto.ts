import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { ConfigDto } from "./config.dto";

export class CreateConfigDto extends OmitType(ConfigDto, ["id", "createdAt", "updatedAt"] as const) {
  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  constructor(data: CreateConfigDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
