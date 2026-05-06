import { INode, IRuntime } from "@/modules/node/types";
import * as fs from "fs";
import * as path from "path";

export interface FileBuffer {
  name: string;
  buffer: Buffer;
}

export class FileSystemStorageNode implements INode {
  id = "internal:node:file-system";

  constructor(public readonly runtime: IRuntime) {}

  async execute(
    inputs: { files: FileBuffer[], path: string },
    config: { basePath: string }
  ): Promise<void> {
    const { files, path: relativePath } = inputs;
    const { basePath } = config;

    const destinationDir = path.join(basePath, relativePath);

    await fs.promises.mkdir(destinationDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(destinationDir, file.name);
      await fs.promises.writeFile(filePath, file.buffer);
    }

    await this.runtime.emit("void", undefined);
    await this.runtime.finish();
  }
}