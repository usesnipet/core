import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { DatabaseSession } from "@/db/types";
import type {
  CreateOpts,
  DeleteOpts,
  ReadOpts,
  TransactionOpts,
  UpdateOpts,
} from "./crud-options";
import { TransactionManager } from "@/modules/database/transaction-manager";
import { Constructable } from "@/types";
import { DrizzleFilterConverter, FilterOptions } from "../filter";
import { schemas } from "@/db/schema";
import { Inject } from "@nestjs/common";

export type CrudIdentity<TTable extends PgTable> = {
  table: TTable;
  idColumn: PgColumn;
};

type IdOf<TTable extends PgTable> = "id" extends keyof InferSelectModel<TTable>
  ? InferSelectModel<TTable>["id"]
  : string;

/**
 * Minimal CRUD with per-method `opts` (including optional `tx`) and overridable hooks.
 * Subclasses must set `identity` (table + id column) and inject `TransactionManager`.
 */
export abstract class BaseCrudService<
  TTable extends PgTable,
  TEntity extends object,
  TCreateDto = InferInsertModel<TTable>,
  TUpdateDto = Partial<InferInsertModel<TTable>>,
  TCreateExtra extends object = Record<never, never>,
  TReadExtra extends object = Record<never, never>,
  TUpdateExtra extends object = Record<never, never>,
  TDeleteExtra extends object = Record<never, never>,
> {
  protected abstract readonly identity: CrudIdentity<TTable>;

  @Inject() protected readonly transactions: TransactionManager;

  protected constructor(
    protected readonly name: keyof typeof schemas,
    protected readonly entityClass: Constructable<TEntity, [InferSelectModel<TTable>]>,
  ) {
  }

  protected get table(): TTable {
    return this.identity.table;
  }

  protected get idColumn(): PgColumn {
    return this.identity.idColumn;
  }

  protected db(opts?: TransactionOpts): DatabaseSession {
    return this.transactions.resolve(opts);
  }

  protected mapFromRow(row: InferSelectModel<TTable>): TEntity {
    return new this.entityClass(row);
  }

  async create(
    dto: TCreateDto,
    opts?: CreateOpts<TCreateExtra>,
  ): Promise<TEntity> {
    const rows = (await this.db(opts)
      .insert(this.table)
      .values(dto as never)
      .returning()) as InferSelectModel<TTable>[];
    const row = rows[0];
    if (!row) {
      throw new Error("create: expected exactly one row from returning()");
    }
    return this.mapFromRow(row);
  }

  async createMany(
    dtos: TCreateDto[],
    opts?: CreateOpts<TCreateExtra>,
  ): Promise<TEntity[]> {
    if (dtos.length === 0) {
      return [];
    }
    const rows = (await this.db(opts)
      .insert(this.table)
      .values(dtos as never)
      .returning()) as InferSelectModel<TTable>[];
    return rows.map((r) => this.mapFromRow(r));
  }

  async findMany(
    filter?: FilterOptions<TEntity>,
    opts?: ReadOpts<TReadExtra>,
  ): Promise<TEntity[]> {
    const rows = await this.db(opts).query[this.name as any].findMany(DrizzleFilterConverter.toFindMany(filter))
    return rows.map((r) => this.mapFromRow(r as InferSelectModel<TTable>));
  }

  async findById(
    id: IdOf<TTable>,
    opts?: ReadOpts<TReadExtra>,
  ): Promise<TEntity | undefined> {
    const rows = (await this.db(opts)
      .select()
      .from(this.table as never)
      .where(eq(this.idColumn, id as never))
      .limit(1)) as InferSelectModel<TTable>[];
    const row = rows[0];
    return row === undefined ? undefined : this.mapFromRow(row);
  }

  async updateById(
    id: IdOf<TTable>,
    dto: TUpdateDto,
    opts?: UpdateOpts<TUpdateExtra>,
  ): Promise<TEntity | undefined> {
    const rows = (await this.db(opts)
      .update(this.table)
      .set(dto as never)
      .where(eq(this.idColumn, id as never))
      .returning()) as InferSelectModel<TTable>[];
    const row = rows[0];
    return row === undefined ? undefined : this.mapFromRow(row);
  }

  async deleteById(
    id: IdOf<TTable>,
    opts?: DeleteOpts<TDeleteExtra>,
  ): Promise<boolean> {
    const rows = (await this.db(opts)
      .delete(this.table)
      .where(eq(this.idColumn, id as never))
      .returning()) as InferSelectModel<TTable>[];
    const row = rows[0];
    return row !== undefined;
  }
}
