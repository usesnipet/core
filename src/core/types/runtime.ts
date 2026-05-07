import { FlowNodeRef } from "../schemas/flow";

export type ExecutionRef = {
  id: string;
  kind: "node";
}

export type ExecutionResult = { outputs: unknown };

export interface IRuntime {
  executeNode(nodeRef: FlowNodeRef, force?: boolean): Promise<void>

  emit(instanceId: string, name: string, data: unknown): Promise<void>;
  finish(instanceId: string): Promise<void>;
}