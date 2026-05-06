import { Flow } from "../schemas/flow";
import { BaseRegistry } from "./base-registry";

export class FlowRegistry extends BaseRegistry<Flow> {
  constructor() {
    super(Flow);
  }
}