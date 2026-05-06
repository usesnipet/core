import { Config, ConfigSchema } from "../schemas/config";
import { Registry } from "./registry";

export class ConfigRegistry extends Registry<Config> {
  constructor() {
    super(ConfigSchema, "Config");
  }
}