import { NormalizedNode } from "../../stage-2-normalization/interfaces/normalized-node";

import { StructuralHints } from "./structural-hints";

export interface ClassifiedNode extends NormalizedNode {
  structuralHints: StructuralHints;
}
