import { env } from "@/env";
import { Injectable } from "@nestjs/common";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared";

import { DocumentExtractor } from "../interfaces/document-extractor";
import { GenericDocument } from "../interfaces/generic-document";

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
    input: string | Blob,
    metadata: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<GenericDocument> {
    let blob: Blob;
    if (typeof input === 'string') {
      blob = new Blob([input], { type: 'text/plain' });
    } else if (input instanceof Blob) {
      blob = input;
    } else {
      blob = new Blob([input]);
    }

    const elements = await this.client.general.partition({
      partitionParameters: {
        files: blob,
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
        fileType: blob.type,
        extractor: 'unstructured',
      },
    };
  }
}
