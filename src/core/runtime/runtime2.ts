import { Flow } from "../schemas/flow";
import { NodeForFlow } from "../types/node-for-flow";
import { buildDependencies } from "./utils/build-dependencies";

export enum RuntimeState {
  READY,
  RUNNING,
  PAUSED,
  STOPPED,
}

export class Runtime {
  state = RuntimeState.READY;
  private dependencies = new Map<string, string[]>();

  constructor(
    private readonly flow: Flow,
    private readonly nodeForFlow: NodeForFlow[],
  ) {
    this.setup();
  }

  setup() {
    this.dependencies = buildDependencies(this.flow);
  }
}