import { Runner, RunnerOptions } from "@/core/runtime/runner";

export class SleepRunner extends Runner {
  id = "internal:node:sleep";

  constructor(options: RunnerOptions) {
    super(options);
  }

  async execute(inputs: { milliseconds: number }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, inputs.milliseconds));
    await this.finish();
  }
}