import { NodeTypeSchema } from "../../schemas/node-type";

import { BaseRegistry } from "./base-registry";

export class NodeTypeRegistry extends BaseRegistry<NodeTypeSchema> {
  constructor() {
    super(NodeTypeSchema);
  }
}

