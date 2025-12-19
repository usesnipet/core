import { NormalizedNode } from "../../stage-2-normalization/interfaces/normalized-node";

export function noiseSignal(node: NormalizedNode): number {
  if (!node.content) return 0;

  let score = 0;

  if (node.content.length < 80) score += 0.3;
  if (/^[A-Z][^.!?]+$/.test(node.content)) score += 0.3;
  if (node.type === 'title') score += 0.4;

  return Math.min(score, 1);
}
