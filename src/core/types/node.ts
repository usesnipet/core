import { IRuntime } from "./runtime";

export interface IRunner {
  id: string;
  runtime: IRuntime;

  execute(inputs: Record<string, unknown>, config?: unknown): Promise<void>;
}