import { GenericDocument } from "./generic-document";

export interface DocumentExtractor {
  readonly name: string;
  readonly supportedTypes: string[];

  extract(
    input: string | Blob,
    metadata: Record<string, any>,
    options?: Record<string, any>
  ): Promise<GenericDocument>;
}
