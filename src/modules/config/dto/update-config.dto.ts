import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

import { CreateConfigDto } from "./create-config.dto";

export class UpdateConfigDto extends PartialType(CreateConfigDto) {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  constructor(data: UpdateConfigDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
