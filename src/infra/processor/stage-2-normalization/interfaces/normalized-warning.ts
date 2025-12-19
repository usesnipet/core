export interface NormalizationWarning {
  nodeId: string;
  type:
    | 'empty-content'
    | 'missing-position'
    | 'invalid-bbox'
    | 'missing-metadata';
  message?: string;
}