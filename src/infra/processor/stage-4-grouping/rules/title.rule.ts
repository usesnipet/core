import { GroupingRule, GroupingRuleContext, GroupingRuleResult } from "../types";

export class TitleRule implements GroupingRule {
  evaluate({ previousNode, currentNode, currentBlockNodes }: GroupingRuleContext): GroupingRuleResult | null {
    if (
      currentBlockNodes.length === 1 &&
      previousNode?.structuralHints && previousNode.structuralHints.titleScore > 0.7 &&
      currentNode.structuralHints.titleScore < 0.4
    ) {
      return { decision: 'continue', confidence: 0.6 };
    }

    if (currentNode.structuralHints?.titleScore > 0.8) {
      return { decision: 'force-break', confidence: 0.95 };
    }

    return null;
  }
}
