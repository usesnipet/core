import { Injectable } from "@nestjs/common";

import { ClassifiedNode } from "../stage-3-classification/interfaces/classification-node";

import { Block } from "./interfaces/block";
import { GroupedDocument } from "./interfaces/grouped-document";
import { ContinuationRule } from "./rules/continuation.rule";
import { ListRule } from "./rules/list.rule";
import { ParagraphRule } from "./rules/paragraph.rule";
import { TableRule } from "./rules/table.rule";
import { TitleRule } from "./rules/title.rule";
import { GroupingRule, GroupingRuleResult } from "./types";
import { BlockBuilder } from "./util/block-builder";

@Injectable()
export class GroupingService {
  private readonly rules: GroupingRule[] = [
    new TableRule(),
    new TitleRule(),
    new ListRule(),
    new ContinuationRule(),
    new ParagraphRule(),
  ];

  group(nodes: ClassifiedNode[], metadata?: any): GroupedDocument {
    const blocks: Block[] = [];
    const builder = new BlockBuilder();

    nodes.forEach((node, index) => {
      if (builder.isEmpty()) {
        builder.start(node, index);
        return;
      }

      const context = {
        previousNode: nodes[index - 1],
        currentNode: node,
        currentBlockNodes: (builder as any).nodes,
      };

      const decision = this.evaluateRules(context);

      if (decision === 'continue') {
        builder.add(node);
      } else {
        blocks.push(builder.build());
        builder.start(node, index);
      }
    });

    if (!builder.isEmpty()) {
      blocks.push(builder.build());
    }

    return { blocks, metadata };
  }

  private evaluateRules(context: any): 'continue' | 'break' {
    let best: GroupingRuleResult | null = null;

    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      if (!result) continue;

      if (
        !best ||
        result.confidence > best.confidence ||
        result.decision === 'force-break'
      ) {
        best = result;
      }

      if (result.decision === 'force-break') break;
    }

    return best?.decision === 'continue' ? 'continue' : 'break';
  }
}
