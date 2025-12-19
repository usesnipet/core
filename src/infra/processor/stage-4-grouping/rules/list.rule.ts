import { GroupingRule, GroupingRuleContext, GroupingRuleResult } from "../types";

export class ListRule implements GroupingRule {
  evaluate({ previousNode, currentNode }: GroupingRuleContext): GroupingRuleResult | null {
    if (
      currentNode.structuralHints?.listItemScore > 0.7 &&
      (!previousNode ||
        previousNode.structuralHints?.listItemScore > 0.7)
    ) {
      return { decision: 'continue', confidence: 0.85 };
    }

    return null;
  }
}
