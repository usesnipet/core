import { PackageSchema } from "@/core/schemas/package";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import { fileSystemStorageRunner, logRunner, sleepRunner } from "./runners";
import schemaJson from "./schema.json";

const { $schema: _packageJsonSchema, ...schema } = schemaJson as typeof schemaJson & {
  $schema?: string;
};
const pkg = plainToInstance(PackageSchema, schema);
const errors = validateSync(pkg as any, { whitelist: true, forbidUnknownValues: false });
if (errors.length) {
  throw new Error(`InternalPackage schema is invalid: ${errors.map((e) => e.toString()).join("; ")}`);
}

export const InternalPackage = {
  schema: pkg,
  runners: [
    logRunner,
    sleepRunner,
    fileSystemStorageRunner,
  ],
};