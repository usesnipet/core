import { randomUUID } from "crypto";

import { DocumentNode } from "../interfaces/document-node";
import { DocumentNodeType } from "../interfaces/document-node-type";

const UNSTRUCTURED_TYPE_MAP: Record<string, DocumentNodeType> = {
  Title: DocumentNodeType.TITLE,
  NarrativeText: DocumentNodeType.PARAGRAPH,
  ListItem: DocumentNodeType.LIST_ITEM,
  Table: DocumentNodeType.TABLE,
  Header: DocumentNodeType.HEADER,
  Footer: DocumentNodeType.FOOTER,
  CodeSnippet: DocumentNodeType.CODE,
  Image: DocumentNodeType.IMAGE,
  FigureCaption: DocumentNodeType.CAPTION,
};

export function mapUnstructuredElementToNode(
  element: any,
  order: number,
): DocumentNode {
  const type = UNSTRUCTURED_TYPE_MAP[element.type] ?? DocumentNodeType.UNKNOWN;

  return {
    id: randomUUID(),
    type,
    content: element.text ?? undefined,
    metadata: element.metadata ?? {},
    confidence: element.confidence,
    position: {
      page: element.metadata?.page_number,
      order,
      bbox: element.metadata?.coordinates,
    },
  };
}
