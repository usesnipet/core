import { pgTable, text, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Extension/package record: a bundle imported into the catalog (manifest of node types, configs, nodes).
 */
export const packageTable = pgTable('package', {
  /** Primary key of the package. */
  id: uuid('id').primaryKey().defaultRandom(),
  /** Semver version of the package. */
  version: varchar({ length: 255 }).notNull(),
  /** Human-readable package name. */
  name: varchar({ length: 255 }).notNull(),
  /** Short summary of what the package provides. */
  description: text('description'),
  /** Url to the package documentation. */
  docs: text('docs'),
  /** Icon name (lucide react icon name) or url to the icon or svg. */
  icon: text('icon'),
  /** Author of the package. */
  author: text('author'),
  /** Creation time of the package. */
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  /** Last update time of the package. */
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

export type PackageRow = typeof packageTable.$inferSelect;
