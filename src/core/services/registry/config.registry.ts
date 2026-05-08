import { ConfigSchema } from "../../schemas/config";

import { BaseRegistry } from "./base-registry";

export class ConfigRegistry extends BaseRegistry<ConfigSchema> {
  constructor() {
    super(ConfigSchema);
  }
}