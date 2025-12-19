import { DocumentNode } from "./document-node";

export interface GenericDocument {
  source: string;
  nodes: DocumentNode[];
  metadata: {
    fileName?: string;
    fileType?: string;
    language?: string;
    [key: string]: any;
  };
}
