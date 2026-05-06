import { Node, NodeSchema } from "../schemas/node";
import { Registry } from "./registry";

export class NodeRegistry extends Registry<Node> {
  constructor() {
    super(NodeSchema, "Node");
  }
}