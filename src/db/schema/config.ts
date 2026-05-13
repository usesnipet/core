import { FieldSchema } from "@/core/schemas/field";
import { index, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

import { packageTable } from "./package";

import type { ConfigTagRow } from "./entity-tags";
/**
 * Config schema definition: field layout and validation for a reusable configuration object.
 */
export const config = pgTable(
  'config',
  {
    /** Primary key of the config. */
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Stable logical id from the manifest (e.g. `internal:config:storage`).
     */
    configId: varchar('config_id', { length: 512 }).notNull(),
    /** Package that owns the config definition. */
    packageId: uuid('package_id').notNull().references(() => packageTable.id, { onDelete: 'cascade' }),
    /** Display name of the config. */
    name: varchar({ length: 255 }).notNull(),
    /** Short description of what the config controls. */
    description: text('description'),
    /** Url to the config documentation. */
    docs: text('docs'),
    /** Icon name (lucide react icon name) or url to the icon or svg. */
    icon: text('icon'),
    /** Author of the config. */
    author: text('author'),
    /** Field definitions keyed by field name (shape matches package `Field` schema). */
    fieldSchema: jsonb('field_schema').notNull().$type<Array<FieldSchema>>().default([]),
    /** Creation time of the config. */
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    /** Last update time of the config. */
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.configId), index('config_package_id_idx').on(t.packageId)],
);

export type ConfigRow = typeof config.$inferSelect & { configTags?: ConfigTagRow[] };
