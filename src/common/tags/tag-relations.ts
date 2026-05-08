import { and, eq, inArray } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { DatabaseSession } from "@/db/types";
import { tag } from "@/db/schema/tag";

type TagJoinTable = PgTable & {
  tagId: PgColumn;
};

export type TagJoinSpec<TJoinTable extends TagJoinTable> = {
  joinTable: TJoinTable;
  ownerIdColumn: PgColumn;
  ownerIdField: string;
};

export async function addTags(
  db: DatabaseSession,
  spec: TagJoinSpec<any>,
  ownerId: string,
  tags: string[],
): Promise<void> {
  if (tags.length === 0) return;

  const tagIds = await db
    .select({ id: tag.id })
    .from(tag)
    .where(inArray(tag.name, tags))
    .execute();

  if (tagIds.length === 0) return;

  await db
    .insert(spec.joinTable)
    .values(tagIds.map(({ id }) => ({ [spec.ownerIdField]: ownerId, tagId: id })))
    .onConflictDoNothing()
    .execute();
}

export async function removeTags(
  db: DatabaseSession,
  spec: TagJoinSpec<any>,
  ownerId: string,
  tags: string[],
): Promise<void> {
  if (tags.length === 0) return;

  const tagIds = await db
    .select({ id: tag.id })
    .from(tag)
    .where(inArray(tag.name, tags))
    .execute();

  if (tagIds.length === 0) return;

  await db
    .delete(spec.joinTable)
    .where(
      and(
        eq(spec.ownerIdColumn, ownerId),
        inArray(spec.joinTable.tagId, tagIds.map(({ id }) => id)),
      ),
    )
    .execute();
}

