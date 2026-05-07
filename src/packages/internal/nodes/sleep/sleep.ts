import { IRunner } from "@/core/types/runner";
import { IRuntime } from "@/core/types/runtime";

export class SleepRunner implements IRunner {
  id = "internal:node:sleep";

  constructor(public readonly runtime: IRuntime) {}

  async execute(inputs: { milliseconds: number }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, inputs.milliseconds));
    await this.runtime.finish();
  }
}