import { FlowNodeRefSchema } from "../schemas/flow";

export type RunnerContext<TConfig = Record<string, unknown>> = {
  instanceId: string;
  emit: (name: string, data: unknown) => Promise<void>;
  finish: () => Promise<void>;
  executeNode: (nodeRef: FlowNodeRefSchema) => Promise<void>;
  config?: TConfig;
};

export type RunnerDef<TInputs = Record<string, unknown>, TConfig = Record<string, unknown>> = {
  id: string;
  execute: (inputs: TInputs, ctx: RunnerContext<TConfig>) => Promise<void>;
};