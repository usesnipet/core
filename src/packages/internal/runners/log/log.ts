import { Runner, RunnerOptions } from "@/core/runtime/runner";

export class LogRunner extends Runner {
  id = "internal:node:log";

  constructor(options: RunnerOptions) {
    super(options);
  }

  async execute(inputs: { message: string }): Promise<void> {
    console.log(inputs.message);
    await this.emit("message", inputs.message);
    await this.finish();
  }
}