import { OmitType, PartialType } from "@nestjs/swagger";

import { NodeType } from "../models/node-type.model";

export class UpdateNodeTypeDto extends PartialType(
  OmitType(NodeType, ["id", "nodeTypeTags", "createdAt", "updatedAt"] as const),
) {
  id: string;
  tags?: string[];

  constructor(data: UpdateNodeTypeDto) {
    super();
    Object.assign(this, data);
  }
}
