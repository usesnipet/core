import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class ConfigDto {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  configId: string;

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

  @ApiProperty({ type: Object })
  @IsObject()
  fieldSchema: Record<string, unknown>;

  @ApiProperty({ type: String, format: "date-time" })
  @IsString()
  createdAt: string;

  @ApiProperty({ type: String, format: "date-time" })
  @IsString()
  updatedAt: string;

  constructor(data: ConfigDto) {
    Object.assign(this, data);
  }
}
