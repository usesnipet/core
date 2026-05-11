import { GraphQLScalarType, Kind, type ValueNode } from "graphql";

function valueFromAST(ast: ValueNode): unknown {
  switch (ast.kind) {
    case Kind.NULL:
      return null;
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.LIST:
      return ast.values.map(valueFromAST);
    case Kind.OBJECT: {
      const o: Record<string, unknown> = {};
      for (const f of ast.fields) {
        o[f.name.value] = valueFromAST(f.value);
      }
      return o;
    }
    default:
      throw new TypeError(`JSONObject literal: unsupported kind ${(ast as ValueNode).kind}`);
  }
}

/** TypeScript marker for GraphQL `JSONObject` (see `GraphQLJSONObject` + `scalarsMap`). */
export class JsonObject {}

export const GraphQLJSONObject = new GraphQLScalarType<Record<string, unknown>, Record<string, unknown>>({
  name: "JSONObject",
  description: "Arbitrary JSON object",
  serialize(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("JSONObject must be a non-null object");
    }
    return value as Record<string, unknown>;
  },
  parseValue(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("JSONObject must be a non-null object");
    }
    return value as Record<string, unknown>;
  },
  parseLiteral(ast) {
    const v = valueFromAST(ast);
    if (v === null || typeof v !== "object" || Array.isArray(v)) {
      throw new TypeError("JSONObject literal must be a non-null object");
    }
    return v as Record<string, unknown>;
  },
});
