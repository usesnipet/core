import { IRuntime } from "./runtime";

export interface INode {
  id: string;
  runtime: IRuntime;

  execute(inputs: unknown, config?: unknown): Promise<void>;
}