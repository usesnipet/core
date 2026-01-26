import { File } from "node:buffer";

export type GetPreSignedUploadUrlOptions = {
  publicAccess?: boolean;
  temp?: boolean
}

export abstract class StorageService {
  abstract providerName(): string;
  abstract getUploadUrl(
    key: string,
    contentType: string,
    opts?: GetPreSignedUploadUrlOptions
  ): Promise<{ url: string, key: string }> | { url: string, key: string };
  abstract getVisualizationUrl(key: string): Promise<{ url: string, key: string }> | { url: string, key: string };
  abstract confirmTempUpload(key: string): Promise<string> | string;
  abstract getPreSignedDownloadUrl(key: string): Promise<string> | string;
  abstract getObject(key: string, opts?: { temp?: boolean }): Promise<File | null> | File | null;
  abstract putObject(
    key: string,
    body: Buffer,
    contentType: string,
    opts?: { bucket?: string, temp?: boolean }
  ): Promise<string>;

  abstract delete(key: string, isFolder?: boolean): Promise<void>;
}