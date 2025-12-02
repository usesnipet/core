import { Controller } from "@/shared/controller/decorators";

import { FileService } from "./file.service";

@Controller("connector/:connectorId/feature/file")
export class FileController {
  constructor(private readonly service: FileService) {}

    // listFiles(folder?: string): Promise<FileData[]>;
    // uploadFile(file: Blob, folder?: string): Promise<FileData>;
    // downloadFile(file: FileData): Promise<Blob>;
    // deleteFile(filePath: string): Promise<void>;

}