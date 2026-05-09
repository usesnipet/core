import { index, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

import { packageTable } from "./package";

/**
 * Node type definition: describes the class of node (e.g. “LLM”, “storage”) including port shapes.
 */
export const nodeType = pgTable(
  'node_type',
  {
    /** Primary key of the node type. */
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Stable logical id from the package manifest (e.g. `internal:node-type:log`).
     */
    typeId: varchar('type_id', { length: 512 }).notNull(),
    /** Owning package that published the node type definition. */
    packageId: uuid('package_id')
      .notNull()
      .references(() => packageTable.id, { onDelete: 'cascade' }),
    /** Display name of the node type (generic capability, not a specific vendor offering). */
    name: varchar({ length: 255 }).notNull(),
    /** Short description of what the node type represents. */
    description: text('description'),
    /** Url to the node type documentation. */
    docs: text('docs'),
    /** Icon name (lucide react icon name) or url to the icon or svg. */
    icon: text('icon'),
    /** Author of the node type. */
    author: text('author'),
    /** Input port definitions keyed by port id. */
    inputs: jsonb('inputs').notNull().$type<Record<string, unknown>>().default({}),
    /** Output port definitions keyed by port id. */
    outputs: jsonb('outputs').notNull().$type<Record<string, unknown>>().default({}),
    /** Optional component attachments keyed by slot id. */
    components: jsonb('components').notNull().$type<Record<string, unknown>>().default({}),
    /** Creation time of the node type. */
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    /** Last update time (UTC). */
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.typeId), index('node_type_package_id_idx').on(t.packageId)],
);

export type NodeTypeRow = typeof nodeType.$inferSelect;
