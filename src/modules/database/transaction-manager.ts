import { Injectable } from "@nestjs/common";
import type { PgTransactionConfig } from "drizzle-orm/pg-core";
import { InjectDatabase } from "@/modules/database/database.decorator";
import type { Database, DatabaseSession } from "@/db/types";
import type { TransactionOpts } from "../../common/crud/crud-options";

/**
 * Central place to start transactions and to resolve which DB handle
 * (root vs `opts.tx`) a repository should use.
 */
@Injectable()
export class TransactionManager {
  constructor(@InjectDatabase() readonly root: Database) {}

  /**
   * Use the transaction from `opts` when present; otherwise the root Drizzle client.
   */
  resolve(opts?: TransactionOpts): DatabaseSession {
    return opts?.tx ?? this.root;
  }

  /**
   * Runs `fn` inside a new PostgreSQL transaction (Drizzle `db.transaction`).
   * Nested calls use savepoints when supported by the driver.
   */
  run<T>(
    fn: (tx: DatabaseSession) => Promise<T>,
    config?: PgTransactionConfig,
  ): Promise<T> {
    return this.root.transaction((tx) => fn(tx), config);
  }
}
