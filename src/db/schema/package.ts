import { pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

import { PackageTagRow } from "./entity-tags";

/**
 * Extension/package record: a bundle imported into the catalog (manifest of node types, configs, nodes).
 */
export const packageTable = pgTable('package', {
  id: uuid('id').primaryKey().defaultRandom(),
  packageId: varchar('package_id', { length: 512 }).notNull(),
  version: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text('description'),
  docs: text('docs'),
  icon: text('icon'),
  author: text('author'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (t) => [unique().on(t.packageId)]);

export type PackageRow = typeof packageTable.$inferSelect & { packageTags?: PackageTagRow[] };
