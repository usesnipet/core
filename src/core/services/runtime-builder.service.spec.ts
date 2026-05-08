import "reflect-metadata";

import { FlowSchema } from "@/core/schemas/flow";
import { NodeSchema } from "@/core/schemas/node";
import { NodeTypeSchema } from "@/core/schemas/node-type";
import { err } from "neverthrow";

import { RunnerDef } from "../runtime/runner";

import { ConfigRegistry } from "./registry/config.registry";
import { RegistryError } from "./registry/errors/registry.error";
import { FlowRegistry } from "./registry/flow.registry";
import { NodeTypeRegistry } from "./registry/node-type.registry";
import { NodeRegistry } from "./registry/node.registry";
import { Registry } from "./registry/registry";
import { RuntimeBuilderService } from "./runtime-builder.service";

export const testRunner: RunnerDef = {
  id: "test-runner",
  execute: async () => {}
}

/**
 * Bypasses NodeType.register() validation/plaining: `plainToInstance` currently flattens
 * `outputs`/`inputs` records incorrectly on NodeType (@Type(Field) + record shape).
 * RuntimeBuilderService only reads types via registry.get().
 */
class SeedableNodeTypeRegistry extends NodeTypeRegistry {
  put(item: NodeTypeSchema): void {
    this.items[item.id] = item;
  }
}

/** Plain ports for seeded node types (shape matches Field for type checks). */
function stringField(): { type: string; description: string } {
  return { type: "string", description: "string field" };
}

function numberField(): { type: string; description: string } {
  return { type: "number", description: "number field" };
}

async function makeRegistry(
  nodes: Array<{ id: string; withRunner?: boolean }>,
  nodeTypes: Array<{
    id: string;
    outputs?: Record<string, { type: string; description: string }>;
    inputs?: Record<string, { type: string; description: string }>;
  }>
): Promise<Registry> {
  const config = new ConfigRegistry();
  const node = new NodeRegistry();
  const nodeType = new SeedableNodeTypeRegistry();
  const flowReg = new FlowRegistry();

  for (const nt of nodeTypes) {
    const payload = { id: nt.id } as NodeTypeSchema;
    if (nt.outputs !== undefined) payload.outputs = nt.outputs as NodeTypeSchema["outputs"];
    if (nt.inputs !== undefined) payload.inputs = nt.inputs as NodeTypeSchema["inputs"];
    nodeType.put(payload);
  }

  for (const n of nodes) {
    const nodeObj = new NodeSchema();
    nodeObj.id = n.id;
    nodeObj.type = "test";
    const reg = await node.register(nodeObj);
    expect(reg.isOk()).toBe(true);
    if (n.withRunner !== false) {
      const rr = node.registerRunner(n.id, testRunner);
      expect(rr.isOk()).toBe(true);
    }
  }

  return new Registry(config, node, nodeType, flowReg);
}

function flow(partial: Omit<ConstructorParameters<typeof FlowSchema>[0], "id"> & { id?: string }): FlowSchema {
  return new FlowSchema({ ...partial, id: partial.id ?? "flow-1" });
}

describe("RuntimeBuilderService", () => {
  test("build succeeds for a single node with no connections", async () => {
    const registry = await makeRegistry([{ id: "node-a" }], [{ id: "node-a" }]);
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [{ instanceId: "i-a", nodeId: "node-a", x: 0, y: 0 }],
      connections: [],
    });

    const result = builder.build(f);
    expect(result.isOk()).toBe(true);
    const runtime = result._unsafeUnwrap();
    expect(runtime.flow).toBe(f);
    expect(runtime.nodes).toHaveLength(1);
    expect(runtime.nodes[0].id).toBe("node-a");
    expect(runtime.nodes[0].runner).toBe(testRunner);
    expect(runtime.dependencies.get("i-a")).toEqual([]);
  });

  test("build succeeds for a linear chain with matching port types", async () => {
    const registry = await makeRegistry(
      [{ id: "src" }, { id: "dst" }],
      [
        { id: "src", outputs: { out: stringField() } },
        { id: "dst", inputs: { in: stringField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "i-src", nodeId: "src", x: 0, y: 0 },
        { instanceId: "i-dst", nodeId: "dst", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "i-src", outputId: "out" },
          target: { instanceId: "i-dst", inputId: "in" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isOk()).toBe(true);
    const runtime = result._unsafeUnwrap();
    expect(runtime.dependencies.get("i-src")).toEqual([]);
    expect(runtime.dependencies.get("i-dst")).toEqual(["i-src"]);
  });

  test("returns error when the flow has a cycle", async () => {
    const registry = await makeRegistry(
      [{ id: "a" }, { id: "b" }],
      [
        { id: "a", outputs: { o: stringField() }, inputs: { i: stringField() } },
        { id: "b", outputs: { o: stringField() }, inputs: { i: stringField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "ia", nodeId: "a", x: 0, y: 0 },
        { instanceId: "ib", nodeId: "b", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "ia", outputId: "o" },
          target: { instanceId: "ib", inputId: "i" },
          active: true,
        },
        {
          source: { instanceId: "ib", outputId: "o" },
          target: { instanceId: "ia", inputId: "i" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("Flow has a cycle");
  });

  test("returns error when a node depends on itself", async () => {
    const registry = await makeRegistry([{ id: "solo" }], [
      { id: "solo", outputs: { o: stringField() }, inputs: { i: stringField() } },
    ]);
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [{ instanceId: "i1", nodeId: "solo", x: 0, y: 0 }],
      connections: [
        {
          source: { instanceId: "i1", outputId: "o" },
          target: { instanceId: "i1", inputId: "i" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("Flow has a cycle");
  });

  test("inactive connections are ignored for cycles and type matching", async () => {
    const registry = await makeRegistry(
      [{ id: "a" }, { id: "b" }],
      [
        { id: "a", outputs: { o: stringField() } },
        { id: "b", inputs: { i: numberField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "ia", nodeId: "a", x: 0, y: 0 },
        { instanceId: "ib", nodeId: "b", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "ia", outputId: "o" },
          target: { instanceId: "ib", inputId: "i" },
          active: false,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isOk()).toBe(true);
  });

  test("returns error when active connection has mismatched output and input types", async () => {
    const registry = await makeRegistry(
      [{ id: "a" }, { id: "b" }],
      [
        { id: "a", outputs: { o: stringField() } },
        { id: "b", inputs: { i: numberField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "ia", nodeId: "a", x: 0, y: 0 },
        { instanceId: "ib", nodeId: "b", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "ia", outputId: "o" },
          target: { instanceId: "ib", inputId: "i" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("Output and input types do not match");
  });

  test("returns error when a flow node id is not registered", async () => {
    const registry = await makeRegistry([{ id: "known" }], [{ id: "known" }]);
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "i1", nodeId: "known", x: 0, y: 0 },
        { instanceId: "i2", nodeId: "missing-node", x: 1, y: 0 },
      ],
      connections: [],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("All nodes are not registered");
  });

  test("returns error when node is registered but runner is missing", async () => {
    const registry = await makeRegistry([{ id: "norunner", withRunner: false }], [{ id: "norunner" }]);
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [{ instanceId: "i1", nodeId: "norunner", x: 0, y: 0 }],
      connections: [],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("Runner not found: norunner");
  });

  test("returns error when node type is not registered for a connected source", async () => {
    const registry = await makeRegistry(
      [
        { id: "no-type", withRunner: true },
        { id: "dst", withRunner: true },
      ],
      [
        // no NodeType for "no-type"
        { id: "dst", inputs: { i: stringField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "i-src", nodeId: "no-type", x: 0, y: 0 },
        { instanceId: "i-dst", nodeId: "dst", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "i-src", outputId: "o" },
          target: { instanceId: "i-dst", inputId: "i" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("Output and input types do not match");
  });

  test("returns error when connection references a missing output or input port", async () => {
    const registry = await makeRegistry(
      [{ id: "src" }, { id: "dst" }],
      [
        { id: "src", outputs: { out: stringField() } },
        { id: "dst", inputs: { in: stringField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "i-src", nodeId: "src", x: 0, y: 0 },
        { instanceId: "i-dst", nodeId: "dst", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "i-src", outputId: "wrong-out" },
          target: { instanceId: "i-dst", inputId: "in" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("Output and input types do not match");
  });

  test("returns error when node.list fails", async () => {
    const registry = await makeRegistry([{ id: "x" }], [{ id: "x" }]);
    jest.spyOn(registry.node, "list").mockReturnValue(err(new RegistryError("boom")));

    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [{ instanceId: "i1", nodeId: "x", x: 0, y: 0 }],
      connections: [],
    });

    const result = builder.build(f);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe("All nodes are not registered");

    jest.restoreAllMocks();
  });

  test("build succeeds for empty nodes array", async () => {
    const registry = await makeRegistry([], []);
    const builder = new RuntimeBuilderService(registry);
    const f = flow({ nodes: [], connections: [] });

    const result = builder.build(f);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().nodes).toHaveLength(0);
  });

  test("multiple dependencies on one target accumulate in order", async () => {
    const registry = await makeRegistry(
      [{ id: "s1" }, { id: "s2" }, { id: "t" }],
      [
        { id: "s1", outputs: { o: stringField() } },
        { id: "s2", outputs: { o: stringField() } },
        { id: "t", inputs: { i1: stringField(), i2: stringField() } },
      ]
    );
    const builder = new RuntimeBuilderService(registry);
    const f = flow({
      nodes: [
        { instanceId: "ia", nodeId: "s1", x: 0, y: 0 },
        { instanceId: "ib", nodeId: "s2", x: 0, y: 1 },
        { instanceId: "it", nodeId: "t", x: 1, y: 0 },
      ],
      connections: [
        {
          source: { instanceId: "ia", outputId: "o" },
          target: { instanceId: "it", inputId: "i1" },
          active: true,
        },
        {
          source: { instanceId: "ib", outputId: "o" },
          target: { instanceId: "it", inputId: "i2" },
          active: true,
        },
      ],
    });

    const result = builder.build(f);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().dependencies.get("it")).toEqual(["ia", "ib"]);
  });
});
