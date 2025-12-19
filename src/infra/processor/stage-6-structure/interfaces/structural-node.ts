import { NoiseAnnotatedBlock } from "../../stage-5-noise-detection/interfaces/noise-annotated-block";

export type StructuralNodeType =
  | 'document'
  | 'section'
  | 'subsection'
  | 'content'
  | 'list'
  | 'table'
  | 'figure';

export interface StructuralNode<T> {
  id: string;
  type: StructuralNodeType;

  title?: string;

  blocks?: NoiseAnnotatedBlock<T>[];

  children: StructuralNode<T>[];

  metadata?: Record<string, any>;
}
