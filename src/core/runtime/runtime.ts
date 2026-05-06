import { INode } from "../types/node";
import { ExecutionContext, ExecutionRef, ExecutionResult, IRuntime } from "../types/runtime";

export class Runtime implements IRuntime {
  constructor(
    private nodeRegistry: Record<string, any>,
    private flowRegistry: Record<string, any>,
    private context: ExecutionContext
  ) {}

  async execute(ref: ExecutionRef, inputs: any): Promise<ExecutionResult> {
    if (ref.kind === "node") return this.executeNode(ref.id, inputs);
    throw new Error("Invalid execution ref");
  }

  private async executeNode(id: string, inputs: any): Promise<ExecutionResult> {
    const NodeClass = this.nodeRegistry[id];
    if (!NodeClass) throw new Error(`Node not found: ${id}`);

    const childRuntime = this.createChildRuntime();

    const instance: INode = new NodeClass(childRuntime);

    await instance.execute(inputs);

    return childRuntime.getResult();
  }

  async emit(name: string, data: unknown): Promise<void> {
    this.context.outputs[name] = data;
  }

  async finish(): Promise<void> {
  }

  private createChildRuntime(): Runtime {
    return new Runtime(
      this.nodeRegistry,
      this.flowRegistry,
      {
        outputs: {},
        trace: { children: [] }
      }
    );
  }

  private getResult(): ExecutionResult {
    return {
      outputs: this.context.outputs
    };
  }
}