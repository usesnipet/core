import { RunnerContext, RunnerDef } from "@/core/runtime/runner";
import * as fs from "fs";
import * as path from "path";

export interface FileBuffer {
  name: string;
  buffer: Buffer;
}

export const fileSystemStorageRunner: RunnerDef = {
  id: "internal:node:file-system",
  execute: async (inputs: { files: FileBuffer[], path: string }, ctx: RunnerContext) => {
    const { files, path: relativePath } = inputs;
    const basePath = ctx.config?.basePath as string;

    const destinationDir = path.join(basePath, relativePath);

    await fs.promises.mkdir(destinationDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(destinationDir, file.name);
      await fs.promises.writeFile(filePath, file.buffer);
    }

    await ctx.emit("void", undefined);
    await ctx.finish();
  }
}