import { StructuralNode } from "./structural-node";

export interface StructuredDocument {
  root: StructuralNode<{ text?: string }>;
  metadata?: Record<string, any>;
}
