import "reflect-metadata";

import { ok } from "neverthrow";
import { Runner, RunnerOptions } from "@/core/runtime/runner";
import { NodeRegistry } from "./node.registry";
import { RegistryError } from "./errors/registry.error";
import { Node } from "@/core/schemas/node";

class DummyRunner extends Runner {
  id = "dummy";
  constructor(options: RunnerOptions) {
    super(options);
  }
  async execute(): Promise<void> {}
}

describe("NodeRegistry", () => {
  test("registerRunner requires node to exist", () => {
    const registry = new NodeRegistry();
    const res = registry.registerRunner("node-1", DummyRunner);
    expect(res.isErr()).toBe(true);
    expect(res._unsafeUnwrapErr()).toBeInstanceOf(RegistryError);
    expect(res._unsafeUnwrapErr().message).toBe("Node not found for runner: node-1");
  });

  test("registerRunner registers and getRunner returns it", async () => {
    const registry = new NodeRegistry();

    const node: Node = { id: "node-1", type: "test" };
    const regRes = await registry.register(node);
    expect(regRes).toEqual(ok(undefined));

    const runnerRes = registry.registerRunner("node-1", DummyRunner);
    expect(runnerRes.isOk()).toBe(true);

    const getRes = registry.getRunner("node-1");
    expect(getRes.isOk()).toBe(true);
    expect(getRes._unsafeUnwrap()).toBe(DummyRunner);
  });

  test("registerRunner rejects duplicates", async () => {
    const registry = new NodeRegistry();
    await registry.register({ id: "node-1", type: "test" });

    expect(registry.registerRunner("node-1", DummyRunner).isOk()).toBe(true);
    const dup = registry.registerRunner("node-1", DummyRunner);
    expect(dup.isErr()).toBe(true);
    expect(dup._unsafeUnwrapErr().message).toBe("Runner already registered: node-1");
  });

  test("getRunner returns not found error", () => {
    const registry = new NodeRegistry();
    const res = registry.getRunner("missing");
    expect(res.isErr()).toBe(true);
    expect(res._unsafeUnwrapErr().message).toBe("Runner not found: missing");
  });
});

