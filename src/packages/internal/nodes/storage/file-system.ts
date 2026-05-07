import { Runner, RunnerOptions } from "@/core/runtime/runner";
import * as fs from "fs";
import * as path from "path";

export interface FileBuffer {
  name: string;
  buffer: Buffer;
}

export class FileSystemStorageRunner extends Runner<{ basePath: string }> {
  id = "internal:node:file-system";

  constructor(options: RunnerOptions<{ basePath: string }>) {
    super(options);
  }

  async execute(
    inputs: { files: FileBuffer[], path: string },
  ): Promise<void> {
    const { files, path: relativePath } = inputs;
    const basePath = this.config.basePath;

    const destinationDir = path.join(basePath, relativePath);

    await fs.promises.mkdir(destinationDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(destinationDir, file.name);
      await fs.promises.writeFile(filePath, file.buffer);
    }

    await this.emit("void", undefined);
    await this.finish();
  }
}