import { IsEnum, IsOptional } from "class-validator";

import { FieldEnumOptions } from "../types";
import { buildApiProperty } from "./api-property";
import { FromBody, FromParams, FromQuery } from "./source";

export const buildEnumDecorators = (opts: FieldEnumOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];
  const isFromBody = !opts.source || opts.source === "body"

  const enumValues = typeof opts.enum === "function" ? opts.enum() : opts.enum;

  if (isFromBody) decorators.push(buildApiProperty(opts));

  if (opts.required === false) decorators.push(IsOptional());

  decorators.push(IsEnum(enumValues as any, { each: opts.isArray }));
  if (opts.debug) console.log("added enum validator", enumValues);

  if (opts.source === "params") decorators.push(FromParams(opts.sourceKey));
  if (opts.source === "query") decorators.push(FromQuery(opts.sourceKey));
  if (isFromBody) decorators.push(FromBody(opts.sourceKey));

  return decorators;
};
