import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { NodeTypeRow } from "@/db/schema/node-type";

export class NodeTypeEntity {
  @ApiProperty({ type: String, format: "uuid", required: true })
  @IsUUID("4", { message: "Id must be a valid UUID" })
  id: string;

  @ApiProperty({ type: String, maxLength: 512, required: true })
  @IsString({ message: "Type id must be a string" })
  @IsNotEmpty({ message: "Type id is required" })
  @MaxLength(512, { message: "Type id must be less than 512 characters" })
  typeId: string;

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
  @IsObject({ message: "Inputs must be an object" })
  @IsNotEmpty({ message: "Inputs is required" })
  inputs: Record<string, unknown> = {};

  @ApiProperty({ type: Object, required: true })
  @IsObject({ message: "Outputs must be an object" })
  @IsNotEmpty({ message: "Outputs is required" })
  outputs: Record<string, unknown> = {};

  @ApiProperty({ type: Object, required: true })
  @IsObject({ message: "Components must be an object" })
  @IsNotEmpty({ message: "Components is required" })
  components: Record<string, unknown> = {};

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Created at must be a date" })
  @IsNotEmpty({ message: "Created at is required" })
  createdAt: Date;

  @ApiProperty({ type: Date, required: true })
  @IsDate({ message: "Updated at must be a date" })
  @IsNotEmpty({ message: "Updated at is required" })
  updatedAt: Date;

  constructor(data: NodeTypeRow) {
    this.id = data.id;
    this.typeId = data.typeId;
    this.packageId = data.packageId;
    this.name = data.name;
    this.description = data.description;
    this.docs = data.docs;
    this.icon = data.icon;
    this.author = data.author;
    this.inputs = data.inputs ?? {};
    this.outputs = data.outputs ?? {};
    this.components = data.components ?? {};
    if (data.createdAt) this.createdAt = new Date(data.createdAt);
    if (data.updatedAt) this.updatedAt = new Date(data.updatedAt);
  }
}

