import { FlowNodeRef } from "../schemas/flow";

export type RunnerOptions<TConfig extends Record<string, unknown> = Record<string, unknown>> = {
  instanceId: string;
  emit: (name: string, data: unknown) => Promise<void>;
  finish: () => Promise<void>;
  executeNode: (nodeRef: FlowNodeRef) => Promise<void>;
  config?: TConfig;
}

export abstract class Runner<TConfig extends Record<string, unknown> = Record<string, unknown>> {
  abstract id: string;

  get instanceId(): string {
    return this.options.instanceId;
  }

  get config(): TConfig {
    return this.options.config ?? ({} as TConfig);
  }

  constructor(private readonly options: RunnerOptions<TConfig>) { }

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