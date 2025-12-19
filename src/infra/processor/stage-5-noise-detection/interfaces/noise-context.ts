import { NoiseAnnotatedBlock } from "./noise-annotated-block";

export interface NoiseContext {
  allBlocks: NoiseAnnotatedBlock<{ text?: string }>[];
  blockIndex: number;
}