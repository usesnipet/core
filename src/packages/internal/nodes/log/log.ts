import { IRunner } from "@/core/types/node";
import { IRuntime } from "@/core/types/runtime";

export class LogRunner implements IRunner {
  id = "internal:node:log";

  constructor(public readonly runtime: IRuntime) {}

  async execute(inputs: { message: string }): Promise<void> {
    console.log(inputs.message);
    await this.runtime.emit("message", inputs.message);
    await this.runtime.finish();
  }
}