import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class TagDto {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(data: TagDto) {
    Object.assign(this, data);
  }
}

