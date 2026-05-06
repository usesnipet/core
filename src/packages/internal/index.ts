import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import { Package } from "@/core/schemas/package";
import { schema } from "./schema";
import { LogRunner, SleepRunner, FileSystemStorageRunner } from "./nodes";

const pkg = plainToInstance(Package, schema);
const errors = validateSync(pkg as any, { whitelist: true, forbidUnknownValues: false });
if (errors.length) {
  throw new Error(`InternalPackage schema is invalid: ${errors.map((e) => e.toString()).join("; ")}`);
}

export const InternalPackage = pkg;
export const Nodes = [
  LogRunner,
  SleepRunner,
  FileSystemStorageRunner,
]