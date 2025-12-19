import { Block } from "./block";

export interface GroupedDocument {
  blocks: Block[];
  metadata?: Record<string, any>;
}
