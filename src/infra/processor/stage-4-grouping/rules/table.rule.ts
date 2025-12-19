import { GroupingRule, GroupingRuleContext, GroupingRuleResult } from "../types";

export class TableRule implements GroupingRule {
  evaluate({ currentNode, currentBlockNodes }: GroupingRuleContext): GroupingRuleResult | null {
    if (currentNode.type === 'table') {
      if (currentBlockNodes.length > 0) {
        return { decision: 'force-break', confidence: 1.0 };
      }
      return { decision: 'continue', confidence: 1.0 };
    }
    return null;
  }
}
