import { GroupingRule, GroupingRuleContext, GroupingRuleResult } from "../types";

export class ParagraphRule implements GroupingRule {
  evaluate({ previousNode, currentNode }: GroupingRuleContext): GroupingRuleResult | null {
    if (!previousNode) return null;

    if (
      previousNode.structuralHints?.paragraphScore > 0.6 &&
      currentNode.structuralHints?.paragraphScore > 0.6
    ) {
      return { decision: 'continue', confidence: 0.7 };
    }

    return null;
  }
}
