export type ExecutionRef = {
  id: string;
  kind: "node";
}

export type ExecutionResult = { outputs: unknown };

export interface IRuntime {
  execute(ref: ExecutionRef, inputs: unknown): Promise<ExecutionResult>;

  emit(name: string, data: unknown): Promise<void>;
  finish(): Promise<void>;
}

export type ExecutionContext = {
  outputs: Record<string, unknown>;
  trace: TraceNode;
}