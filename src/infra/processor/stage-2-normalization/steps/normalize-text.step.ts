import { NormalizedNode } from "../interfaces/normalized-node";
import { normalizeTextContent } from "../utils/text-utils";

export function normalizeText(node: NormalizedNode): NormalizedNode {
  if (!node.content) return node;

  return {
    ...node,
    content: normalizeTextContent(node.content),
  };
}
