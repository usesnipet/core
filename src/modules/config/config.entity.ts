import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ConfigRow } from "@/db/schema/config";

export class ConfigEntity {
  @ApiProperty({ type: String, format: "uuid", required: true })
  @IsUUID("4", { message: "Id must be a valid UUID" })
  id: string;

  @ApiProperty({ type: String, maxLength: 512, required: true })
  @IsString({ message: "Config id must be a string" })
  @IsNotEmpty({ message: "Config id is required" })
  @MaxLength(512, { message: "Config id must be less than 512 characters" })
  configId: string;

  @ApiProperty({ type: String, format: "uuid", required: true })
  @IsUUID("4", { message: "Package id must be a valid UUID" })
  packageId: string;

  @ApiProperty({ type: String, maxLength: 255, required: true })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(255, { message: "Name must be less than 255 characters" })
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString({ message: "Description must be a string" })
  @IsOptional()
  description: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString({ message: "Docs must be a string" })
  @IsOptional()
  docs: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString({ message: "Icon must be a string" })
  @IsOptional()
  icon: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString({ message: "Author must be a string" })
  @IsOptional()
  author: string | null;

  @ApiProperty({ type: Object, required: true })
  @IsObject({ message: "Field schema must be an object" })
  @IsNotEmpty({ message: "Field schema is required" })
  fieldSchema: Record<string, unknown> = {};

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Created at must be a date" })
  @IsNotEmpty({ message: "Created at is required" })
  createdAt: Date;

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Updated at must be a date" })
  @IsNotEmpty({ message: "Updated at is required" })
  updatedAt: Date;

  constructor(data: ConfigRow) {
    this.id = data.id;
    this.configId = data.configId;
    this.packageId = data.packageId;
    this.name = data.name;
    this.description = data.description;
    this.docs = data.docs;
    this.icon = data.icon;
    this.author = data.author;
    this.fieldSchema = data.fieldSchema ?? {};
    if (data.createdAt) this.createdAt = new Date(data.createdAt);
    if (data.updatedAt) this.updatedAt = new Date(data.updatedAt);
  }
}

