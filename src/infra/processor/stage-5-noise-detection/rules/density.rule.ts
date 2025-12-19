import { NoiseAnnotatedBlock } from "../interfaces/noise-annotated-block";
import { NoiseRule } from "../interfaces/noise-rule";

export class LowDensityRule<T extends { text?: string }> implements NoiseRule<T> {
  name = 'low-density';

  evaluate(block: NoiseAnnotatedBlock<T>) {
    const text = block.nodes.map(n => n.text ?? '').join(' ').trim();
    if (!text) return null;

    const tokens = text.split(/\s+/);
    if (tokens.length < 5) {
      return {
        score: 0.6,
        reason: 'Very low textual density',
      };
    }

    return null;
  }
}
