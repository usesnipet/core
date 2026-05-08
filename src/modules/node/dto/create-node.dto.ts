import { ApiProperty, OmitType } from "@nestjs/swagger";
import { NodeEntity } from "../node.entity";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateNodeDto extends OmitType(NodeEntity, ["id", "createdAt", "updatedAt"] as const) {
  @ApiProperty({ type: [String], required: false })
  @IsArray({ message: "Tags must be an array" })
  @IsOptional()
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];
}

