export type FileData = {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: number;
  metadata?: Record<string, any>;
}

export interface IFileManagementProvider {
  listFiles(folder?: string): Promise<FileData[]>;
  uploadFile(file: Blob, folder?: string): Promise<FileData>;
  downloadFile(file: FileData): Promise<Blob>;
  deleteFile(filePath: string): Promise<void>;
}