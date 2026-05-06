import { Constructable } from "./constructable";
import { IRunner } from "./node";
import { Node } from "../schemas/node";

export interface NodeForFlow {
  node: Node;
  runner: Constructable<IRunner>;
}