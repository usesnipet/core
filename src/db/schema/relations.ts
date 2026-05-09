import { relations } from "drizzle-orm";

import { config } from "./config";
import {
  configTag,
  nodeTag,
  nodeTypeTag,
  packageTag,
} from "./entity-tags";
import { node } from "./node";
import { nodeType } from "./node-type";
import { packageTable } from "./package";
import { tag } from "./tag";

export const packageRelations = relations(packageTable, ({ many }) => ({
  nodeTypes: many(nodeType),
  configs: many(config),
  nodes: many(node),
  packageTags: many(packageTag),
}));

export const nodeTypeRelations = relations(nodeType, ({ one, many }) => ({
  package: one(packageTable, {
    fields: [nodeType.packageId],
    references: [packageTable.id],
  }),
  nodes: many(node),
  nodeTypeTags: many(nodeTypeTag),
}));

export const configRelations = relations(config, ({ one, many }) => ({
  package: one(packageTable, {
    fields: [config.packageId],
    references: [packageTable.id],
  }),
  nodes: many(node),
  configTags: many(configTag),
}));

export const nodeRelations = relations(node, ({ one, many }) => ({
  package: one(packageTable, {
    fields: [node.packageId],
    references: [packageTable.id],
  }),
  nodeType: one(nodeType, {
    fields: [node.nodeTypeId],
    references: [nodeType.id],
  }),
  config: one(config, {
    fields: [node.configId],
    references: [config.id],
  }),
  nodeTags: many(nodeTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  packageTags: many(packageTag),
  nodeTags: many(nodeTag),
  nodeTypeTags: many(nodeTypeTag),
  configTags: many(configTag),
}));

export const packageTagRelations = relations(packageTag, ({ one }) => ({
  package: one(packageTable, {
    fields: [packageTag.packageId],
    references: [packageTable.id],
  }),
  tag: one(tag, {
    fields: [packageTag.tagId],
    references: [tag.id],
  }),
}));

export const nodeTagRelations = relations(nodeTag, ({ one }) => ({
  node: one(node, {
    fields: [nodeTag.nodeId],
    references: [node.id],
  }),
  tag: one(tag, {
    fields: [nodeTag.tagId],
    references: [tag.id],
  }),
}));

export const nodeTypeTagRelations = relations(nodeTypeTag, ({ one }) => ({
  nodeType: one(nodeType, {
    fields: [nodeTypeTag.nodeTypeId],
    references: [nodeType.id],
  }),
  tag: one(tag, {
    fields: [nodeTypeTag.tagId],
    references: [tag.id],
  }),
}));

export const configTagRelations = relations(configTag, ({ one }) => ({
  config: one(config, {
    fields: [configTag.configId],
    references: [config.id],
  }),
  tag: one(tag, {
    fields: [configTag.tagId],
    references: [tag.id],
  }),
}));
