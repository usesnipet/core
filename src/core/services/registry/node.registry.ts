import { Result, err, ok } from "neverthrow";
import { BaseRegistry } from "./base-registry";
import { RegistryError } from "./errors/registry.error";
import { Constructable } from "@/types";
import { Runner } from "@/core/runtime/runner";
import { Node } from "@/core/schemas/node";
import { RunnerOptions } from "@/core/runtime/runner";

export class NodeRegistry extends BaseRegistry<Node> {
  private runners: Record<string, Constructable<Runner, [RunnerOptions]>> = {};

  constructor() {
    super(Node);
  }

  registerRunner(id: string, runner: Constructable<Runner, [RunnerOptions]>): Result<void, RegistryError> {
    if (this.runners[id]) return err(new RegistryError(`Runner already registered: ${id}`));
    if (!this.items[id]) return err(new RegistryError(`Node not found for runner: ${id}`));
    this.runners[id] = runner;
    return ok(undefined);
  }

  getRunner(id: string): Result<Constructable<Runner, [RunnerOptions]>, RegistryError> {
    const runner = this.runners[id];
    if (!runner) return err(new RegistryError(`Runner not found: ${id}`));
    return ok(runner);
  }
}