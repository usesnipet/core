import { NormalizedNode } from "../interfaces/normalized-node";
import { NormalizationWarning } from "../interfaces/normalized-warning";

export function validateNode(
  node: NormalizedNode,
): NormalizationWarning[] {
  const warnings: NormalizationWarning[] = [];

  if (node.content !== undefined && node.content.length === 0) {
    warnings.push({
      nodeId: node.id,
      type: 'empty-content',
    });
  }

  if (!node.position?.order ||node.position?.order < 0) {
    warnings.push({
      nodeId: node.id,
      type: 'missing-position',
    });
  }

  return warnings;
}
