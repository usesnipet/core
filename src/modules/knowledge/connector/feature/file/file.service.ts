import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConnectorService } from "../../connector.service";
import { GenericService } from "@/shared/generic-service";

@Injectable()
export class FileService extends GenericService {
  logger = new Logger(FileService.name);

  @Inject() private readonly connectorService: ConnectorService;


    // listFiles(folder?: string): Promise<FileData[]>;
    // uploadFile(file: Blob, folder?: string): Promise<FileData>;
    // downloadFile(file: FileData): Promise<Blob>;
    // deleteFile(filePath: string): Promise<void>;

  // async listFiles(connectorId: string, folder?: string) {
  //   const connector = await this.connectorService.findByID(connectorId);
  //   if (!connector) throw new NotFoundException('Connector not found');
  //   return connector.fileManagementProvider.listFiles(folder);
  // }
}