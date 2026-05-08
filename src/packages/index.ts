import { RunnerDef } from "@/core/runtime/runner";
import { PackageSchema } from "@/core/schemas/package";

import { InternalPackage } from "./internal";

export type PackageRegistry = Array<{
  schema: PackageSchema;
  runners: RunnerDef[];
}>;

export const packages: PackageRegistry = [
  InternalPackage,
];
