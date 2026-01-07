import { ExtractedDocumentNode } from "./document-node";

export interface ExtractedDocument {
  source: string;
  nodes: ExtractedDocumentNode[];
  metadata: {
    fileName?: string;
    fileType?: string;
    language?: string;
    [key: string]: any;
  };
}
