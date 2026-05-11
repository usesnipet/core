import { FilterOptions, FilterOptionsInit } from "./filter-options";

export type FilterAccessList = {
  allow?: string[];
  deny?: string[];
};

export type FilterHttpConfig = {
  select?: FilterAccessList;
  where?: FilterAccessList;
  order?: FilterAccessList;
  relations?: FilterAccessList;
  maxLimit?: number;
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function uniqStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function applyAccessList(values: string[] | undefined, access?: FilterAccessList): string[] | undefined {
  if (!values?.length) return undefined;
  let out = uniqStrings(values);
  if (access?.allow?.length) {
    const allow = new Set(access.allow);
    out = out.filter((v) => allow.has(v));
  }
  if (access?.deny?.length) {
    const deny = new Set(access.deny);
    out = out.filter((v) => !deny.has(v));
  }
  return out.length ? out : undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {
        // fallthrough to comma split
      }
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(value)].filter(Boolean);
}

function parseJsonIfPossible(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

function parseOrder(value: unknown): Array<{ field: string; direction?: 'asc' | 'desc' }> | undefined {
  if (value === undefined || value === null) return undefined;

  const parsed = parseJsonIfPossible(value);
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (!item) return undefined;
        if (typeof item === 'string') {
          const [field, direction] = item.split(':');
          return field ? { field: field.trim(), direction: (direction?.trim() as any) || undefined } : undefined;
        }
        if (typeof item === 'object') {
          const o = item as any;
          if (!o.field) return undefined;
          return { field: String(o.field), direction: (o.direction as any) || undefined };
        }
        return undefined;
      })
      .filter(Boolean) as any;
  }

  if (typeof parsed === 'string') {
    const parts = parsed.split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return undefined;
    return parts.map((p) => {
      const [field, direction] = p.split(':');
      return { field: field.trim(), direction: (direction?.trim() as any) || undefined };
    });
  }

  return undefined;
}

function parseWhere(value: unknown): Record<string, any> | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = parseJsonIfPossible(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as any;
  return undefined;
}

function sanitizeWhere(
  where: Record<string, any> | undefined,
  access?: FilterAccessList
): Record<string, any> | undefined {
  if (!where || typeof where !== 'object') return undefined;
  let keys = Object.keys(where);
  keys = applyAccessList(keys, access) ?? [];
  if (!keys.length) return undefined;
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = where[k];
  return Object.keys(out).length ? out : undefined;
}

export class HttpFilterConverter {
  static fromQuery<TEntity extends object = any>(
    query: Record<string, any>,
    config: FilterHttpConfig = {}
  ): FilterOptions<TEntity> {
    const whereRaw = parseWhere(query.where) as any;
    const selectRaw = toStringArray(query.select) as any;
    const orderRaw = parseOrder(query.order) as any;
    const relationsRaw = toStringArray(query.relations);

    const limit = toNumber(query.limit);
    const take = toNumber(query.take);
    const effectiveLimit = limit ?? take;
    const maxLimit = config.maxLimit;
    const clampedLimit =
      effectiveLimit === undefined
        ? undefined
        : maxLimit === undefined
          ? effectiveLimit
          : Math.min(effectiveLimit, maxLimit);

    const init: FilterOptionsInit<TEntity> = {
      where: sanitizeWhere(whereRaw, config.where) as any,
      select: applyAccessList(selectRaw, config.select) as any,
      relations: applyAccessList(relationsRaw, config.relations) as any,
      order: orderRaw
        ?.filter((o) => o?.field)
        .filter((o) => {
          const allowed = applyAccessList([o.field], config.order);
          return Boolean(allowed?.length);
        }) as any,
      limit: clampedLimit,
      take: undefined,
      offset: toNumber(query.offset),
      skip: toNumber(query.skip),
    };
    return new FilterOptions<TEntity>(init);
  }

  static toQuery(filter: FilterOptions<any>): Record<string, any> {
    const q: Record<string, any> = {};
    if (filter.where) q.where = JSON.stringify(filter.where);
    if (filter.select?.length) q.select = filter.select.join(',');
    if (filter.order?.length) q.order = filter.order.map((o) => `${o.field}:${o.direction || 'asc'}`).join(',');
    if (filter.limit !== undefined) q.limit = String(filter.limit);
    if (filter.take !== undefined) q.take = String(filter.take);
    if (filter.offset !== undefined) q.offset = String(filter.offset);
    if (filter.skip !== undefined) q.skip = String(filter.skip);
    if (filter.relations?.length) q.relations = filter.relations.join(",");
    return q;
  }
}

