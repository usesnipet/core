import { Injectable } from "@nestjs/common";

import { NoiseProcessedDocument } from "./interfaces/noise-processed-document";
import { NoiseRule } from "./interfaces/noise-rule";
import { LowDensityRule } from "./rules/density.rule";
import { RepetitionRule } from "./rules/repetition.rule";

@Injectable()
export class NoiseDetectionService {
  private rules: NoiseRule[] = [
    new LowDensityRule(),
    new RepetitionRule(),
  ];

  process(document: NoiseProcessedDocument): NoiseProcessedDocument {
    const blocks = document.blocks.map((block, index) => {
      const context = {
        allBlocks: document.blocks,
        blockIndex: index,
      };

      let totalScore = 0;
      const reasons: string[] = [];

      for (const rule of this.rules) {
        const result = rule.evaluate(block, context);
        if (result) {
          totalScore += result.score;
          reasons.push(`${rule.name}: ${result.reason}`);
        }
      }

      if (totalScore > 0) {
        block.noise = {
          score: Math.min(1, totalScore),
          reasons,
        };
      }

      return block;
    });

    return { ...document, blocks };
  }
}
