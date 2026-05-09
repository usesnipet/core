import { TransactionManager } from "@/modules/database/transaction-manager";
import { Inject } from "@nestjs/common";

import { TransactionOpts } from "./";

import type { DatabaseSession } from "@/db/types";
/**
 * Minimal CRUD with per-method `opts` (including optional `tx`) and overridable hooks.
 * Subclasses must set `identity` (table + id column) and inject `TransactionManager`.
 */
export abstract class BaseService {
  @Inject() protected readonly transactions: TransactionManager;

  protected db(opts?: TransactionOpts): DatabaseSession {
    return this.transactions.resolve(opts);
  }
}
