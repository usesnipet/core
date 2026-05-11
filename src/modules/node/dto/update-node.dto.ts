import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

import { CreateNodeDto } from "./create-node.dto";

export class UpdateNodeDto extends PartialType(CreateNodeDto) {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  constructor(data: UpdateNodeDto) {
    super();
    if (data) Object.assign(this, data);
  }
}

