import type { FieldNode, GraphQLResolveInfo, SelectionSetNode } from "graphql";

import {
  FilterCondition, FilterOptionsInit, FilterPrimitive, FilterWhere, FilterWhereOp
} from "./filter-options";
import { GraphQLFilterArgsType } from "./graphql-filter-args";

function walkSelections(
  selectionSet: SelectionSetNode | undefined,
  fragments: GraphQLResolveInfo["fragments"],
  onField: (field: FieldNode) => void,
): void {
  if (!selectionSet) return;
  for (const sel of selectionSet.selections) {
    if (sel.kind === "Field") {
      onField(sel);
    } else if (sel.kind === "FragmentSpread") {
      const frag = fragments[sel.name.value];
      if (frag) walkSelections(frag.selectionSet, fragments, onField);
    } else if (sel.kind === "InlineFragment") {
      walkSelections(sel.selectionSet, fragments, onField);
    }
  }
}

function uniqStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function toFilterCondition(where: Record<string, any>): Record<string, FilterCondition> {
  const result: Record<string, FilterCondition> = {};
  if (!where) return result;
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if (typeof value === 'object') {
      Object.entries(value).forEach(([op, v]) => {
        result[key] = { op: op as FilterWhereOp, value: v as FilterPrimitive };
      });
    } else {
      result[key] = { op: 'eq', value };
    }
  }
  return result;
}
export class GraphQLFilterConverter {
  static toFilterOptions<Model extends object = any>(
    info: GraphQLResolveInfo,
    args: GraphQLFilterArgsType
  ): FilterOptionsInit<Model> {
    const scalars: string[] = [];
    const relations: string[] = [];

    const root = info.fieldNodes[0];
    if (!root?.selectionSet) {
      return {};
    }

    walkSelections(root.selectionSet, info.fragments, (field) => {
      const name = field.name.value;
      if (name === "__typename") return;

      if (!field.selectionSet) {
        scalars.push(name);
        return;
      }

      relations.push(name);
      walkSelections(field.selectionSet, info.fragments, (sub) => {
        const subName = sub.name.value;
        if (subName === "__typename") return;
        if (sub.selectionSet) {
          relations.push(`${name}.${subName}`);
        }
      });
    });

    const init: FilterOptionsInit<Model> = {
      where: toFilterCondition(args.where as Record<string, any>) as FilterWhere<Model>,
      take: args.take,
      skip: args.skip,
    };
    const sel = uniqStrings(scalars);
    if (sel.length) init.select = sel as FilterOptionsInit<Model>["select"];
    const rel = uniqStrings(relations);
    if (rel.length) init.relations = rel as FilterOptionsInit<Model>["relations"];

    return init;
  }
}
