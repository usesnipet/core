import { boolean, pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';


export const apiKey = pgTable('api_key', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true, mode: 'string' }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
  revoked: boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
