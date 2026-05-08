import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { TagRow } from "@/db/schema/tag";

export class TagEntity {
  @ApiProperty({ type: String, format: "uuid", required: true })
  @IsUUID("4", { message: "Id must be a valid UUID" })
  id: string;

  @ApiProperty({ type: String, maxLength: 255, required: true })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(255, { message: "Name must be less than 255 characters" })
  name: string;

  constructor(data: TagRow) {
    this.id = data.id;
    this.name = data.name;
  }
}

