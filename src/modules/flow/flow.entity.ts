import { FlowRow } from "@/db/schema/flow";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class FlowEntity {
  @ApiProperty({ type: String, format: "uuid", required: true })
  @IsUUID("4", { message: "Id must be a valid UUID" })
  id: string;

  @ApiProperty({ type: String, maxLength: 255, required: true })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(255, { message: "Name must be less than 255 characters" })
  name: string;

  @ApiProperty({ type: String, maxLength: 255 })
  @IsString({ message: "Description must be a string" })
  @IsOptional()
  description: string | null;

  @ApiProperty({ type: Boolean, required: true })
  @IsBoolean({ message: "Active must be a boolean" })
  @IsNotEmpty({ message: "Active is required" })
  active: boolean;

  @ApiProperty({ type: Object, required: true })
  @IsObject({ message: "Code must be an object" })
  @IsNotEmpty({ message: "Code is required" })
  code: Record<string, unknown> = {};

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Created at must be a date" })
  @IsNotEmpty({ message: "Created at is required" })
  createdAt: Date;

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Updated at must be a date" })
  @IsNotEmpty({ message: "Updated at is required" })
  updatedAt: Date;

  constructor(data: FlowRow) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.active = data.active;
    this.code = data.code;
    if (data.createdAt) this.createdAt = new Date(data.createdAt);
    if (data.updatedAt) this.updatedAt = new Date(data.updatedAt);
  }
}
