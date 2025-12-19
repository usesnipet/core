import { DocumentNode } from "../../stage-1-extraction/interfaces/document-node";
import { NormalizedNode } from "../interfaces/normalized-node";

export function preserveOriginal(node: DocumentNode): NormalizedNode {
  return {
    id: node.id,
    type: node.type,
    content: node.content,
    position: {
      page: node.position?.page,
      order: node.position?.order ?? -1,
      bbox: node.position?.bbox,
    },
    metadata: { ...(node.metadata ?? {}) },
    original: node,
  };
}
