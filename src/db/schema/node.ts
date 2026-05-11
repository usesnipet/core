import { index, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import type { NodeTagRow } from './entity-tags';
import { config } from './config';
import { packageTable } from './package';
import { nodeType } from './node-type';

/**
 * Node: a concrete offering that users instantiate in flows (e.g. a specific Google embedding model).
 */
export const node = pgTable(
  'node',
  {
    /** Primary key of the node. */
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Stable logical id from the manifest (e.g. `internal:node:log`).
     */
    nodeId: varchar('node_id', { length: 512 }).notNull(),
    /** Package that published the node definition (may differ from the package that defines the node type). */
    packageId: uuid('package_id')
      .notNull()
      .references(() => packageTable.id, { onDelete: 'cascade' }),
    /** User-facing name of the node (e.g. model or integration name). */
    name: varchar({ length: 255 }).notNull(),
    /** Marketing or picker description of the node (distinct from the generic node type blurb). */
    description: text('description'),
    /** Url to the node documentation. */
    docs: text('docs'),
    /** Icon name (lucide react icon name) or url to the icon or svg. */
    icon: text('icon'),
    /** Author of the node. */
    author: text('author'),
    /** Node type that the node implements; may belong to another package than `packageId`. */
    nodeTypeId: uuid('node_type_id')
      .notNull()
      .references(() => nodeType.id, { onDelete: 'restrict' }),
    /**
     * Optional linked configuration schema for the node;
     * null when the node uses only inline defaults or no config.
     */
    configId: uuid('config_id').references(() => config.id, { onDelete: 'set null' }),
    /** Creation time of the node. */
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    /** Last update time of the node. */
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.nodeId),
    index('node_package_id_idx').on(t.packageId),
    index('node_node_type_id_idx').on(t.nodeTypeId),
    index('node_config_id_idx').on(t.configId),
  ],
);

export type NodeRow = typeof node.$inferSelect & { nodeTags?: NodeTagRow[] };
