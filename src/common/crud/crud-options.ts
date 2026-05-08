import type { DatabaseSession } from "@/db/types";

/**
 * Shared piece for all CRUD method options: run queries on an existing DB handle
 * (typically a Drizzle transaction) instead of the root pool client.
 */
export type TransactionOpts = {
  tx?: DatabaseSession;
};

/**
 * Base shape for per-method options. Extend via intersection:
 *
 *   type FlowCreateOpts = CreateOpts<{ skipAudit?: boolean }>;
 */
export type CreateOpts<Extra extends object = Record<never, never>> =
  TransactionOpts & Extra;

export type ReadOpts<Extra extends object = Record<never, never>> =
  TransactionOpts & Extra;

export type UpdateOpts<Extra extends object = Record<never, never>> =
  TransactionOpts & Extra;

export type DeleteOpts<Extra extends object = Record<never, never>> =
  TransactionOpts & Extra;
