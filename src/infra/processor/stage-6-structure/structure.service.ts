import { Injectable } from "@nestjs/common";

import { StructuredDocument } from "./interfaces/structured-document";
import { createNode } from "./utils/node-factory";
import { inferTitleLevel } from "./utils/title-levels";

@Injectable()
export class StructureService {

  build(blocks: any[], metadata?: any): StructuredDocument {
    const root = createNode('document', { children: [] });
    const stack: { level: number; node: any }[] = [
      { level: 0, node: root },
    ];

    for (const block of blocks) {
      const firstNode = block.nodes[0];
      const hints = firstNode?.structuralHints;

      const isTitle =
        hints?.titleScore > 0.7 && (!block.noise || block.noise.score < 0.4);

      if (isTitle) {
        const titleText = firstNode.text ?? '';
        const level = inferTitleLevel(titleText);

        while (stack.length > level) {
          stack.pop();
        }

        const sectionNode = createNode(
          level === 1 ? 'section' : 'subsection',
          {
            title: titleText,
            blocks: [block],
          },
        );

        stack[stack.length - 1].node.children.push(sectionNode);
        stack.push({ level, node: sectionNode });
      } else {
        const contentNode = createNode('content', {
          blocks: [block],
        });

        stack[stack.length - 1].node.children.push(contentNode);
      }
    }

    return { root, metadata };
  }
}
