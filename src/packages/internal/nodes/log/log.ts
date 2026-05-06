import { INode, IRuntime } from "@/modules/node/types";

export class LogNode implements INode {
  id = "internal:node:log";

  constructor(public readonly runtime: IRuntime) {}

  async execute(inputs: { message: string }): Promise<void> {
    console.log(inputs.message);
    await this.runtime.emit("message", inputs.message);
    await this.runtime.finish();
  }
}