import { NoiseHint } from "./noise-hint";

export interface NoiseAnnotatedBlock<T> {
  id: string;
  type: string;
  nodes: T[];

  noise?: NoiseHint;

  metadata?: Record<string, any>;
}
