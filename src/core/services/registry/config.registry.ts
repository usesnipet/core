import { Config } from "../../schemas/config";
import { BaseRegistry } from "./base-registry";

export class ConfigRegistry extends BaseRegistry<Config> {
  constructor() {
    super(Config);
  }
}