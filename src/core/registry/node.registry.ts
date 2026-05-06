import { Result, err, ok } from "neverthrow";
import { Node } from "../schemas/node";
import { IRunner } from "../types/node";
import { BaseRegistry } from "./base-registry";
import { RegistryError } from "./errors/registry.error";
import { IRuntime } from "../types/runtime";
import { Constructable } from "../types/constructable";

export class NodeRegistry extends BaseRegistry<Node> {
  private runners: Record<string, Constructable<IRunner>> = {};

  constructor() {
    super(Node);
  }

  registerRunner(id: string, runner: Constructable<IRunner>): Result<void, RegistryError> {
    if (this.runners[id]) return err(new RegistryError(`Runner already registered: ${id}`));
    if (!this.items[id]) return err(new RegistryError(`Node not found for runner: ${id}`));
    this.runners[id] = runner;
    return ok(undefined);
  }

  getRunner(id: string): Result<Constructable<IRunner>, RegistryError> {
    const runner = this.runners[id];
    if (!runner) return err(new RegistryError(`Runner not found: ${id}`));
    return ok(runner);
  }
}