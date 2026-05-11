import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

import { NodeTypeDto } from "./node-type.dto";

export class CreateNodeTypeDto extends OmitType(NodeTypeDto, ["id", "createdAt", "updatedAt"] as const) {
  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  constructor(data: CreateNodeTypeDto) {
    super();
    if (data) Object.assign(this, data);
  }
}