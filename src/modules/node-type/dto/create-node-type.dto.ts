import { OmitType } from "@nestjs/swagger";

import { NodeType } from "../models/node-type.model";

export class CreateNodeTypeDto extends OmitType(
  NodeType,
  ["id", "nodeTypeTags", "createdAt", "updatedAt"] as const,
) {
  tags?: string[];

  constructor(data: CreateNodeTypeDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
