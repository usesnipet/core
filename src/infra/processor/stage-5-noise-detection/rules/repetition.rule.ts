import { NoiseAnnotatedBlock } from "../interfaces/noise-annotated-block";
import { NoiseContext } from "../interfaces/noise-context";
import { NoiseRule } from "../interfaces/noise-rule";

export class RepetitionRule<T extends { text?: string }> implements NoiseRule<T> {
  name = 'repetition';

  evaluate(
    block: NoiseAnnotatedBlock<T>,
    context: NoiseContext<T>,
  ) {
    const text = block.nodes.map(n => n.text ?? '').join(' ').trim();
    if (!text) return null;

    const occurrences = context.allBlocks.filter(b =>
      b.nodes.some(n => (n.text ?? '').trim() === text),
    ).length;

    if (occurrences > 2) {
      return {
        score: 0.7,
        reason: 'Repeated content across document',
      };
    }

    return null;
  }
}
