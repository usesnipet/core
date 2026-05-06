import { Result, err, ok } from "neverthrow";
import { FlowRegistry } from "../registry/flow.registry";
import { NodeRegistry } from "../registry/node.registry";
import { ExecutionContext, ExecutionRef, ExecutionResult, IRuntime } from "../types/runtime";
import { RuntimeError } from "./runtime.error";
import { Flow, FlowConnection, FlowNodeRef } from "../schemas/flow";

export class Runtime implements IRuntime {
  private nodesMap = new Map<string, FlowNodeRef>();
  private dependencies = new Map<string, string[]>();

  private results = new Map<string, ExecutionResult>();
  private executing = new Map<string, Promise<ExecutionResult>>();
  private flowConnections: FlowConnection[] = [];

  constructor(
    private nodeRegistry: NodeRegistry,
    private flowRegistry: FlowRegistry,
    private context: ExecutionContext = { outputs: {} }
  ) {}

  private buildGraph(flow: Flow) {
    this.nodesMap.clear();
    this.dependencies.clear();

    for (const node of flow.nodes) {
      this.nodesMap.set(node.instanceId, node);
      this.dependencies.set(node.instanceId, []);
    }

    for (const conn of flow.connections) {
      if (!conn.active) continue;

      const deps = this.dependencies.get(conn.target.instanceId)!;
      deps.push(conn.source.instanceId);
    }
  }

  private validateFlow(flow: Flow) {
    for (const node of flow.nodes) {
      const res = this.nodeRegistry.get(node.nodeId);
      if (res.isErr()) {
        throw new RuntimeError(`Node not found: ${node.nodeId}`);
      }
    }

    this.validateNoCycles();
  }

  private validateNoCycles() {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const visit = (id: string): boolean => {
      if (stack.has(id)) return true;
      if (visited.has(id)) return false;

      visited.add(id);
      stack.add(id);

      for (const dep of this.dependencies.get(id) || []) {
        if (visit(dep)) return true;
      }

      stack.delete(id);
      return false;
    };

    for (const id of this.nodesMap.keys()) {
      if (visit(id)) {
        throw new RuntimeError("Cycle detected in flow");
      }
    }
  }

  async start(flowId: string, inputs: unknown): Promise<Result<void, RuntimeError>> {
    const flowResult = this.flowRegistry.get(flowId);
    if (flowResult.isErr()) return err(new RuntimeError(`Flow not found: ${flowId}`));
    const flow = flowResult.value;

    this.buildGraph(flow);
    this.validateFlow(flow);

    const startNode = flow.startNode;
    if (!startNode) {
      return err(new RuntimeError("Start node not found"));
    }

    await this.execute({ kind: "node", id: startNode.instanceId }, inputs);

    return ok(undefined);
  }

  async execute(ref: ExecutionRef, inputs: any): Promise<ExecutionResult> {
    if (ref.kind === "node") return this.executeNode(ref.id, inputs);
    throw new Error("Invalid execution ref");
  }

  private async executeNode(instanceId: string, inputs?: any): Promise<ExecutionResult> {
    // cache
    if (this.results.has(instanceId)) {
      return this.results.get(instanceId)!;
    }

    // evitar execução duplicada
    if (this.executing.has(instanceId)) {
      return this.executing.get(instanceId)!;
    }

    const promise = (async () => {
      const nodeRef = this.nodesMap.get(instanceId);
      if (!nodeRef) throw new RuntimeError(`Node not found: ${instanceId}`);

      // 🔹 1. resolve dependências
      const deps = this.dependencies.get(instanceId) || [];

      await Promise.all(deps.map(dep => this.executeNode(dep)));

      // 🔹 2. montar inputs
      const finalInputs = this.buildInputs(instanceId, inputs);

      // 🔹 3. executar node
      const result = await this.runNode(nodeRef, finalInputs);

      this.results.set(instanceId, result);

      return result;
    })();

    this.executing.set(instanceId, promise);

    return promise;
  }

  private async runNode(nodeRef: FlowNodeRef, inputs: any): Promise<ExecutionResult> {
    const nodeResult = this.nodeRegistry.get(nodeRef.nodeId);
    if (nodeResult.isErr()) {
      throw new RuntimeError(`Node not found: ${nodeRef.nodeId}`);
    }

    const NodeClass = nodeResult.value;

    const childRuntime = this.createChildRuntime();

    const instance = new NodeClass(childRuntime);

    await instance.execute(inputs, nodeRef.config);

    return childRuntime.getResult();
  }

  private createChildRuntime(): Runtime {
    return new Runtime(
      this.nodeRegistry,
      this.flowRegistry,
      { outputs: {} }
    );
  }

  private buildInputs(instanceId: string, initialInputs: any) {
    const inputs: Record<string, any> = { ...(initialInputs || {}) };

    for (const conn of this.flowConnections) {
      if (!conn.active) continue;
      if (conn.target.instanceId !== instanceId) continue;

      const sourceResult = this.results.get(conn.source.instanceId);
      if (!sourceResult) continue;

      inputs[conn.target.inputId] =
        sourceResult.outputs[conn.source.outputId];
    }

    return inputs;
  }

  async emit(name: string, data: unknown): Promise<void> {
    this.context.outputs[name] = data;
  }

  async finish(): Promise<void> {
  }
}