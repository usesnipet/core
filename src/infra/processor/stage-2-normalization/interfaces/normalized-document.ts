import { NormalizedNode } from "./normalized-node";
import { NormalizationWarning } from "./normalized-warning";

export interface NormalizedDocument {
  nodes: NormalizedNode[];
  warnings: NormalizationWarning[];
  metadata: Record<string, any>;
}
