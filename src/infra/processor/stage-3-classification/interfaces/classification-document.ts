import { ClassifiedNode } from "./classification-node";

export interface ClassifiedDocument {
  nodes: ClassifiedNode[];
  metadata: Record<string, any>;
}
