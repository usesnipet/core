import { FlowSchema } from "../../schemas/flow";

import { BaseRegistry } from "./base-registry";

export class FlowRegistry extends BaseRegistry<FlowSchema> {
  constructor() {
    super(FlowSchema);
  }
}