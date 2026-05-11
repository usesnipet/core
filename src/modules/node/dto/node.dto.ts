import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class NodeDto {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  packageId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  nodeTypeId: string;

  @ApiProperty({ type: String, format: "uuid", nullable: true, required: false })
  @IsOptional()
  @IsUUID()
  configId: string | null;

  @ApiProperty({ type: String, format: "date-time" })
  @IsString()
  createdAt: string;

  @ApiProperty({ type: String, format: "date-time" })
  @IsString()
  updatedAt: string;

  constructor(data: NodeDto) {
    Object.assign(this, data);
  }
}

