import { OmitType } from "@nestjs/swagger";

import { Node } from "../models/node.model";

export class CreateNodeDto extends OmitType(Node, ["id", "nodeTags", "createdAt", "updatedAt"] as const) {
  tags?: string[];

  constructor(data: CreateNodeDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
