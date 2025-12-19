import { NoiseAnnotatedBlock } from "./noise-annotated-block";

export interface NoiseProcessedDocument {
  blocks: NoiseAnnotatedBlock<{ text?: string }>[];
  metadata?: Record<string, any>;
}
