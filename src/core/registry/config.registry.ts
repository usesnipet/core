import { Config } from "../schemas/config";
import { Registry } from "./registry";

export class ConfigRegistry extends Registry<Config> {
  constructor() {
    super(Config);
  }
}