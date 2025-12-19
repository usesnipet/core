import { NormalizedNode } from "../interfaces/normalized-node";

export function normalizePosition(
  nodes: NormalizedNode[],
): NormalizedNode[] {
  const sorted = [...nodes].sort((a, b) => {
    if (a.position?.page !== b.position?.page) return (a.position?.page ?? 0) - (b.position?.page ?? 0);
    return (a.position?.order ?? 0) - (b.position?.order ?? 0);
  });

  return sorted.map((node, index) => ({
    ...node,
    position: {
      ...node.position,
      order: index,
    },
  }));
}
