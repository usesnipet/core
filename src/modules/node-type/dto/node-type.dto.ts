import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class NodeTypeDto {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  packageId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  category: string;

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

  @ApiProperty({ type: Object })
  @IsOptional()
  @IsObject()
  inputs: Record<string, unknown> | null;

  @ApiProperty({ type: Object })
  @IsOptional()
  @IsObject()
  outputs: Record<string, unknown> | null;

  @ApiProperty({ type: Object })
  @IsOptional()
  @IsObject()
  components: Record<string, unknown> | null;

  @ApiProperty({ type: String, format: "date-time" })
  @IsString()
  createdAt: string;

  @ApiProperty({ type: String, format: "date-time" })
  @IsString()
  updatedAt: string;

  constructor(data: NodeTypeDto) {
    Object.assign(this, data);
  }
}
