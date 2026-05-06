import { IRuntime } from "./runtime";

export interface IRunner {
  id: string;
  runtime: IRuntime;

  execute(inputs: unknown, config?: unknown): Promise<void>;
}