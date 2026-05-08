import { RunnerDef } from "@/core/runtime/runner";
import { Package } from "@/core/schemas/package";

import { InternalPackage } from "./internal";

export type PackageRegistry = Array<{
  schema: Package;
  runners: RunnerDef[];
}>;

export const packages: PackageRegistry = [
  InternalPackage,
];
