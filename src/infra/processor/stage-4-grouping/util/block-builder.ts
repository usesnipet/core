import { randomUUID } from "crypto";

import { ClassifiedNode } from "../../stage-3-classification/interfaces/classification-node";
import { Block } from "../interfaces/block";

export class BlockBuilder {
  private nodes: ClassifiedNode[] = [];
  private startIndex = 0;

  start(node: ClassifiedNode, index: number) {
    this.nodes = [node];
    this.startIndex = index;
  }

  add(node: ClassifiedNode) {
    this.nodes.push(node);
  }

  build(): Block {
    return {
      id: randomUUID(),
      type: 'mixed',
      nodes: this.nodes,
      startIndex: this.startIndex,
      endIndex: this.startIndex + this.nodes.length - 1,
    };
  }

  isEmpty() {
    return this.nodes.length === 0;
  }
}
