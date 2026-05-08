import { jsonb } from 'drizzle-orm/pg-core';
import { boolean, pgTable, text, varchar, uuid, timestamp } from 'drizzle-orm/pg-core';

export const flow = pgTable('flow', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  code: jsonb('code').notNull().$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

export type FlowRow = typeof flow.$inferSelect;