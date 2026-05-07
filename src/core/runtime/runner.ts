import { FlowNodeRef } from "../schemas/flow";

export type RunnerOptions = {
  instanceId: string;
  emit: (name: string, data: unknown) => Promise<void>;
  finish: () => Promise<void>;
  executeNode: (nodeRef: FlowNodeRef) => Promise<void>;
  config?: Record<string, unknown>;
}

export abstract class Runner {
  id: string;

  constructor(private readonly options: RunnerOptions) {
    this.id = options.instanceId;
  }

  async emit(name: string, data: unknown): Promise<void> {
    await this.options.emit(name, data);
  }

  async finish(): Promise<void> {
    await this.options.finish();
  }

  async executeNode(nodeRef: FlowNodeRef): Promise<void> {
    await this.options.executeNode(nodeRef);
  }

  abstract execute(inputs: Record<string, unknown>): Promise<void>;
}