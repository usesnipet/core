import { DocumentNodeType } from "./document-node-type";

export interface DocumentNode {
  id: string;
  type: DocumentNodeType;
  content?: string;
  metadata?: Record<string, any>;

  position?: {
    page?: number; // page number
    order?: number; // order within page
    bbox?: [number, number, number, number]; // OCR bounding box coordinates
  };

  confidence?: number; // Confidence of the extractor for this type
}
