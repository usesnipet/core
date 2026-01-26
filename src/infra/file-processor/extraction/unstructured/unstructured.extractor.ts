import { env } from "@/env";
import { Injectable } from "@nestjs/common";
import { UnstructuredClient } from "unstructured-client";
import { Files, Strategy } from "unstructured-client/sdk/models/shared";

import { DocumentExtractor } from "../interfaces/document-extractor";
import { ExtractedDocument } from "../interfaces/extracted-document";

import { File } from "node:buffer";
import { mapUnstructuredElementToNode } from "./unstructured.mapper";

@Injectable()
export class UnstructuredExtractor implements DocumentExtractor {
  readonly name = 'unstructured';
  readonly supportedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'application/json',
    'text/html',
    'text/markdown',
  ];

  private client: UnstructuredClient;

  constructor() {
    this.client = new UnstructuredClient({ serverURL: env.UNSTRUCTURED_API_URL });
  }

  async extract(
    input: File,
    metadata: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<ExtractedDocument> {
    const elements = await this.client.general.partition({
      partitionParameters: {
        files: { content: await input.arrayBuffer(), fileName: input.name } as Files,
        strategy: Strategy.Auto,
        ...options,
      },
    });

    if (!Array.isArray(elements)) throw new Error('Unexpected Unstructured response');

    const nodes = elements.map(mapUnstructuredElementToNode);

    return {
      source: 'unstructured',
      nodes,
      metadata: {
        ...metadata,
        fileType: input.type,
        extractor: 'unstructured',
      },
    };
  }
}
