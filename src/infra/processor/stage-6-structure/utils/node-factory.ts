import { randomUUID } from "crypto";

import { StructuralNode, StructuralNodeType } from "../interfaces/structural-node";

export function createNode(
  type: StructuralNodeType,
  data?: Partial<StructuralNode<{ text?: string }>>,
): StructuralNode<{ text?: string }> {
  return {
    id: randomUUID(),
    type,
    children: [],
    ...data,
  };
}
