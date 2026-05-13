import { FieldSchema } from "@/core/schemas/field";
import { NodeTypeComponentSchema } from "@/core/schemas/node-type";
import { index, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

import { packageTable } from "./package";

import type { NodeTypeTagRow } from "./entity-tags";
/**
 * Node type definition: describes the class of node (e.g. “LLM”, “storage”) including port shapes.
 */
export const nodeType = pgTable(
  'node_type',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    typeId: varchar('type_id', { length: 512 }).notNull(),
    packageId: uuid('package_id')
      .notNull()
      .references(() => packageTable.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    description: text('description'),
    docs: text('docs'),
    icon: text('icon'),
    author: text('author'),
    inputs: jsonb('inputs').$type<Array<FieldSchema>>().default([]),
    outputs: jsonb('outputs').$type<Array<FieldSchema>>().default([]),
    components: jsonb('components').$type<Array<NodeTypeComponentSchema>>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.typeId), index('node_type_package_id_idx').on(t.packageId)],
);

export type NodeTypeRow = typeof nodeType.$inferSelect & { nodeTypeTags?: NodeTypeTagRow[] };
