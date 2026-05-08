import { RunnerDef } from "@/core/runtime/runner";
import { NodeSchema } from "@/core/schemas/node";
import { err, ok, Result } from "neverthrow";

import { BaseRegistry } from "./base-registry";
import { RegistryError } from "./errors/registry.error";

export class NodeRegistry extends BaseRegistry<NodeSchema> {
  private runners: Record<string, RunnerDef> = {};

  constructor() {
    super(NodeSchema);
  }

  registerRunner(id: string, runner: RunnerDef): Result<void, RegistryError> {
    if (this.runners[id]) return err(new RegistryError(`Runner already registered: ${id}`));
    if (!this.items[id]) return err(new RegistryError(`Node not found for runner: ${id}`));
    this.runners[id] = runner;
    return ok(undefined);
  }

  getRunner(id: string): Result<RunnerDef, RegistryError> {
    const runner = this.runners[id];
    if (!runner) return err(new RegistryError(`Runner not found: ${id}`));
    return ok(runner);
  }
}