import { inArray } from "drizzle-orm";

import { FilterCondition, FilterOptions } from "./filter-options";

function normalizeCondition(condition: FilterCondition): { op: string; value: any } {
  if (condition && typeof condition === 'object' && 'op' in condition) {
    const c: any = condition;
    return { op: c.op, value: c.value };
  }
  return { op: 'eq', value: condition };
}

export class DrizzleFilterConverter {
  /**
   * Converte `FilterOptions` para as opções do `db.query.<table>.findMany({ ... })`.
   *
   * Observação: essa função assume que `tableFields` é o objeto `fields` recebido
   * nas callbacks `where/orderBy/columns` do Drizzle Query API.
   */
  static toFindMany<TEntity extends object = any>(
    filter?: FilterOptions<TEntity>
  ): {
    where?: (fields: any, operators: any) => any;
    orderBy?: (fields: any, operators: any) => any[];
    limit?: number;
    offset?: number;
    columns?: Record<string, boolean>;
  } {
    if (!filter) return {};
    const limit = filter.limit ?? filter.take;
    const offset = filter.offset ?? filter.skip;

    const columns =
      filter.select?.length
        ? Object.fromEntries(filter.select.map((k) => [k, true]))
        : undefined;

    const where =
      filter.where && Object.keys(filter.where).length
        ? (fields: any, operators: any) => {
            const clauses: any[] = [];
            for (const [key, raw] of Object.entries(filter.where as any)) {
              if (raw === undefined) continue;
              const col = fields?.[key];
              if (!col) continue;

              const { op, value } = normalizeCondition(raw as any);
              switch (op) {
                case 'eq':
                  clauses.push(operators.eq(col, value));
                  break;
                case 'ne':
                  clauses.push(operators.ne(col, value));
                  break;
                case 'gt':
                  clauses.push(operators.gt(col, value));
                  break;
                case 'gte':
                  clauses.push(operators.gte(col, value));
                  break;
                case 'lt':
                  clauses.push(operators.lt(col, value));
                  break;
                case 'lte':
                  clauses.push(operators.lte(col, value));
                  break;
                case 'like':
                  clauses.push(operators.like(col, String(value)));
                  break;
                case 'ilike':
                  clauses.push(operators.ilike(col, String(value)));
                  break;
                case 'contains':
                  clauses.push(operators.ilike(col, `%${String(value)}%`));
                  break;
                case 'in': {
                  const arr = Array.isArray(value) ? value : [value];
                  clauses.push(inArray(col, arr as any));
                  break;
                }
                default:
                  clauses.push(operators.eq(col, value));
              }
            }
            if (!clauses.length) return undefined;
            return clauses.length === 1 ? clauses[0] : operators.and(...clauses);
          }
        : undefined;

    const orderBy =
      filter.order?.length
        ? (fields: any, operators: any) => {
            return filter.order!
              .map((o) => {
                const col = fields?.[o.field];
                if (!col) return undefined;
                const dir = (o.direction || 'asc').toLowerCase();
                return dir === 'desc' ? operators.desc(col) : operators.asc(col);
              })
              .filter(Boolean) as any[];
          }
        : undefined;

    return {
      where,
      orderBy,
      limit,
      offset,
      columns,
    };
  }
}

