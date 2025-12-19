import { NormalizedNode } from "../interfaces/normalized-node";

export function normalizeMetadata(node: NormalizedNode): NormalizedNode {
  const metadata = { ...(node.metadata ?? {}) };

  if (metadata.page_number && !metadata.page) {
    metadata.page = Number(metadata.page_number);
    delete metadata.page_number;
  }

  return {
    ...node,
    metadata,
  };
}
