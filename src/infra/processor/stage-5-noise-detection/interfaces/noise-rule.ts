import { NoiseAnnotatedBlock } from "./noise-annotated-block";
import { NoiseContext } from "./noise-context";

export interface NoiseRule {
  name: string;
  evaluate(
    block: NoiseAnnotatedBlock<{ text?: string }>,
    context: NoiseContext<{ text?: string }>,
  ): { score: number; reason: string } | null;
}
