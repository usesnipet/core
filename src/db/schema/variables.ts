import { boolean, pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { flow } from './flow';
import { pgEnum } from 'drizzle-orm/pg-core';


export const variableScope = pgEnum("scope", ["flow", "global"]);

export const variables = pgTable('variables', {
  id: uuid('id').primaryKey(),
  description: text('description'),
  flowId: uuid('flow_id').references(() => flow.id, { onDelete: 'cascade' }),
  scope: variableScope('scope').notNull().default("flow"),
  key: text('key').notNull(),
  value: text('value').notNull(),
  encrypted: boolean('encrypted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
