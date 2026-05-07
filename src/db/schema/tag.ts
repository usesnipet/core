import { pgTable, unique, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Normalized tag label shared across packages and catalog entities.
 */
export const tag = pgTable('tag', {
  /** Primary key of the tag. */
  id: uuid('id').primaryKey().defaultRandom(),
  /** Name of the tag. */
  name: varchar({ length: 255 }).notNull(),
}, (t) => [unique().on(t.name)]);

export type TagRow = typeof tag.$inferSelect;
