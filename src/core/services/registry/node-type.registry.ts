import { NodeType } from "../../schemas/node-type";
import { BaseRegistry } from "./base-registry";

export class NodeTypeRegistry extends BaseRegistry<NodeType> {
  constructor() {
    super(NodeType);
  }
}

