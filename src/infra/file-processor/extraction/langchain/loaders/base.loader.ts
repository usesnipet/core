import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { randomUUID } from 'crypto';
import { ExtractedDocument,  } from '../../interfaces/extracted-document';
import { ExtractedDocumentNode } from "../../interfaces/document-node";
import { DocumentNodeType } from "../../interfaces/document-node-type";

export abstract class BaseLoader {
  protected splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  protected createDocumentNodes(
    docs: { pageContent: string; metadata?: Record<string, any> }[],
    metadata: Record<string, any>,
  ): ExtractedDocumentNode[] {
    return docs.map(({ pageContent, metadata: docMetadata = {} }, index) => ({
      id: randomUUID(),
      type: DocumentNodeType.PARAGRAPH,
      content: pageContent,
      metadata: {
        ...metadata,
        ...docMetadata,
      },
      position: {
        order: index,
        page: docMetadata?.pageNumber || 1,
      },
    }));
  }

  protected createDocument(
    nodes: ExtractedDocumentNode[],
    metadata: Record<string, any>,
  ): ExtractedDocument {
    return {
      source: 'langchain',
      nodes,
      metadata: {
        ...metadata,
        extractor: 'langchain',
      },
    };
  }

  abstract process(
    blob: Blob,
    metadata: Record<string, any>
  ): Promise<ExtractedDocument>;
}