import { Package } from "@/core/schemas/package";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import { FileSystemStorageRunner, LogRunner, SleepRunner } from "./runners";
import { schema } from "./schema";

const pkg = plainToInstance(Package, schema);
const errors = validateSync(pkg as any, { whitelist: true, forbidUnknownValues: false });
if (errors.length) {
  throw new Error(`InternalPackage schema is invalid: ${errors.map((e) => e.toString()).join("; ")}`);
}

export const InternalPackage = {
  schema: pkg,
  runners: [
    LogRunner,
    SleepRunner,
    FileSystemStorageRunner,
  ],
};