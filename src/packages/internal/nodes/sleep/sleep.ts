import { INode, IRuntime } from "@/modules/node/types";

export class SleepNode implements INode {
  id = "internal:node:sleep";

  constructor(public readonly runtime: IRuntime) {}

  async execute(inputs: { milliseconds: number }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, inputs.milliseconds));
    await this.runtime.finish(undefined);
  }
}