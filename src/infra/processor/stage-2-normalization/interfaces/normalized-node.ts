import { DocumentNode } from "../../stage-1-extraction/interfaces/document-node";

export interface NormalizedNode extends DocumentNode {
  original: DocumentNode;
}