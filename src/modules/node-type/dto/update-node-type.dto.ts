import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

import { CreateNodeTypeDto } from "./create-node-type.dto";

export class UpdateNodeTypeDto extends PartialType(CreateNodeTypeDto) {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  constructor(data: UpdateNodeTypeDto) {
    super();
    if (data) Object.assign(this, data);
  }
}