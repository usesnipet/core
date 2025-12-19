import { ClassifiedNode } from "../../stage-3-classification/interfaces/classification-node";
import { BlockType } from "../types";

export interface Block {
  id: string;
  type: BlockType;
  nodes: ClassifiedNode[];
  startIndex: number;
  endIndex: number;
}
