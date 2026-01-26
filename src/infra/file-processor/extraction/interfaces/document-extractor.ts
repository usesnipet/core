import { File } from "node:buffer";
import { ExtractedDocument } from "./extracted-document";

export interface DocumentExtractor {
  readonly name: string;
  readonly supportedTypes: string[];

  extract(
    input: File,
    metadata: Record<string, any>,
    options?: Record<string, any>
  ): Promise<ExtractedDocument>;
}
