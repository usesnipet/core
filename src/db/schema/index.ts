import { apiKey } from "./api-key";
import { config } from "./config";
import {
  configTag,
  nodeTag,
  nodeTypeTag,
  packageTag,
} from "./entity-tags";
import { flow } from "./flow";
import { node } from "./node";
import { nodeType } from "./node-type";
import { packageTable } from "./package";
import { tag } from "./tag";

export const schemas = {
  apiKey,
  config,
  configTag,
  flow,
  node,
  nodeTag,
  nodeType,
  nodeTypeTag,
  package: packageTable,
  packageTag,
  tag,
};