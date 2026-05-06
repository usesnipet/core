import { Result, err, ok } from "neverthrow";
import { FlowRegistry } from "../registry/flow.registry";
import { NodeRegistry } from "../registry/node.registry";
import { ExecutionContext, ExecutionRef, ExecutionResult, IRuntime } from "../types/runtime";
import { RuntimeError } from "./runtime.error";

export class Runtime implements IRuntime {
  constructor(
    private nodeRegistry: NodeRegistry,
    private flowRegistry: FlowRegistry,
    private context: ExecutionContext = { outputs: {} }
  ) {}

  async start(flowId: string, inputs: unknown): Promise<Result<void, RuntimeError>> {
    const flowResult = this.flowRegistry.get(flowId);
    if (flowResult.isErr()) return err(new RuntimeError(`Flow not found: ${flowId}`, flowResult.error));
    const flow = flowResult.value;
    for (const nodeRef of flow.nodes) {
      const nodeResult = this.nodeRegistry.get(nodeRef.nodeId);
      if (nodeResult.isErr()) return err(new RuntimeError(`Node not found: ${nodeRef.nodeId}`, nodeResult.error));
    }
    void inputs;
    return ok(undefined);
  }

  async execute(ref: ExecutionRef, inputs: any): Promise<ExecutionResult> {
    if (ref.kind === "node") return this.executeNode(ref.id, inputs);
    throw new Error("Invalid execution ref");
  }

  private async executeNode(id: string, inputs: any): Promise<ExecutionResult> {
    // Note: node implementation lookup/instantiation isn't wired yet in this core.
    // For now, ensure the node is registered and fail with a clear error.
    const nodeResult = this.nodeRegistry.get(id);
    if (nodeResult.isErr()) throw new Error(`Node not found: ${id}`);
    void inputs;
    throw new Error(`Node execution not implemented for: ${id}`);
  }

  async emit(name: string, data: unknown): Promise<void> {
    this.context.outputs[name] = data;
  }

  async finish(): Promise<void> {
  }

  private createChildRuntime(): Runtime {
    return new Runtime(this.nodeRegistry, this.flowRegistry);
  }

  private getResult(): ExecutionResult {
    return {
      outputs: this.context.outputs
    };
  }
}