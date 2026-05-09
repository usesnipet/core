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
import {
  configRelations,
  configTagRelations,
  nodeRelations,
  nodeTagRelations,
  nodeTypeRelations,
  nodeTypeTagRelations,
  packageRelations,
  packageTagRelations,
  tagRelations,
} from "./relations";
import { tag } from "./tag";

export const schemas = {
  apiKey,
  config,
  configRelations,
  configTag,
  configTagRelations,
  flow,
  node,
  nodeRelations,
  nodeTag,
  nodeTagRelations,
  nodeType,
  nodeTypeRelations,
  nodeTypeTag,
  nodeTypeTagRelations,
  package: packageTable,
  packageRelations,
  packageTag,
  packageTagRelations,
  tag,
  tagRelations,
};