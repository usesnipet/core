import { Flow } from "../schemas/flow";
import { Registry } from "./registry";

export class FlowRegistry extends Registry<Flow> {
  constructor() {
    super(Flow);
  }
}