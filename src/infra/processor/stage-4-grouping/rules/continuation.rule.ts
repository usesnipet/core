import { GroupingRule, GroupingRuleContext, GroupingRuleResult } from "../types";

export class ContinuationRule implements GroupingRule {
  evaluate(context: GroupingRuleContext): GroupingRuleResult | null {
    if (!context.previousNode) return null;

    if (
      context.previousNode.structuralHints?.continuationScore > 0.7 &&
      context.currentNode.structuralHints?.continuationScore > 0.7 &&
      context.previousNode.position?.page === context.currentNode.position?.page
    ) {
      return { decision: 'continue', confidence: 0.9 };
    }

    return null;
  }
}
