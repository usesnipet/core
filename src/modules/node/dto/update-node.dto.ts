import { PartialType } from "@nestjs/swagger";

import { CreateNodeDto } from "./create-node.dto";

export class UpdateNodeDto extends PartialType(CreateNodeDto) {
  id: string;

  constructor(data: UpdateNodeDto) {
    super();
    Object.assign(this, data);
  }
}
