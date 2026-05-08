import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { PackageRow } from "@/db/schema/package";

export class PackageEntity {
  @ApiProperty({ type: String, format: "uuid", required: true })
  @IsUUID("4", { message: "Id must be a valid UUID" })
  id: string;

  @ApiProperty({ type: String, maxLength: 255, required: true })
  @IsString({ message: "Version must be a string" })
  @IsNotEmpty({ message: "Version is required" })
  @MaxLength(255, { message: "Version must be less than 255 characters" })
  version: string;

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

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Created at must be a date" })
  @IsNotEmpty({ message: "Created at is required" })
  createdAt: Date;

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Updated at must be a date" })
  @IsNotEmpty({ message: "Updated at is required" })
  updatedAt: Date;

  constructor(data: PackageRow) {
    this.id = data.id;
    this.version = data.version;
    this.name = data.name;
    this.description = data.description;
    this.docs = data.docs;
    this.icon = data.icon;
    this.author = data.author;
    if (data.createdAt) this.createdAt = new Date(data.createdAt);
    if (data.updatedAt) this.updatedAt = new Date(data.updatedAt);
  }
}

