import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { config } from "./config";
import { node } from "./node";
import { nodeType } from "./node-type";
import { packageTable } from "./package";
import { tag, TagRow } from "./tag";

/**
 * Associates tags with packages for filtered browsing and discovery.
 */
export const packageTag = pgTable('package_tag', {
  /** Package receiving the tag. */
  packageId: uuid('package_id')
    .notNull()
    .references(() => packageTable.id, { onDelete: 'cascade' }),
  /** Tag applied to the package. */
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.packageId, t.tagId] })]);

/**
 * Associates tags with nodes (e.g. vendor- or capability-specific labels).
 */
export const nodeTag = pgTable('node_tag', {
  /** Node receiving the tag. */
  nodeId: uuid('node_id')
    .notNull()
    .references(() => node.id, { onDelete: 'cascade' }),
  /** Tag applied to the node. */
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.nodeId, t.tagId] })]);

/**
 * Associates tags with node types (e.g. “generative”, “storage”).
 */
export const nodeTypeTag = pgTable('node_type_tag', {
  /** Node type receiving the tag. */
  nodeTypeId: uuid('node_type_id')
    .notNull()
    .references(() => nodeType.id, { onDelete: 'cascade' }),
  /** Tag applied to the node type. */
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.nodeTypeId, t.tagId] })]);

/**
 * Associates tags with configuration schemas.
 */
export const configTag = pgTable( 'config_tag', {
  /** Config definition receiving the tag. */
  configId: uuid('config_id')
    .notNull()
    .references(() => config.id, { onDelete: 'cascade' }),
  /** Tag applied to the config. */
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.configId, t.tagId] })]);

export type PackageTagRow = typeof packageTag.$inferSelect & { tag?: TagRow };
export type NodeTagRow = typeof nodeTag.$inferSelect & { tag?: TagRow };
export type NodeTypeTagRow = typeof nodeTypeTag.$inferSelect & { tag?: TagRow };
export type ConfigTagRow = typeof configTag.$inferSelect & { tag?: TagRow };
