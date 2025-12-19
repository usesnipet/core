import { ClassifiedNode } from "../stage-3-classification/interfaces/classification-node";

export type BlockType =
  | 'text'
  | 'list'
  | 'table'
  | 'figure'
  | 'mixed';

export type GroupingDecision = 'continue' | 'break' | 'force-break';

export interface GroupingRuleContext {
  previousNode?: ClassifiedNode;
  currentNode: ClassifiedNode;
  currentBlockNodes: ClassifiedNode[];
}

export interface GroupingRuleResult {
  decision: GroupingDecision;
  confidence: number;
}

export interface GroupingRule {
  evaluate(context: GroupingRuleContext): GroupingRuleResult | null;
}
