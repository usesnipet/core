import { IsEnum, IsOptional } from "class-validator";

import { FieldEnumOptions } from "../types";
import { buildApiProperty } from "./api-property";

export const buildEnumDecorators = (opts: FieldEnumOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];

  const enumValues = typeof opts.enum === "function" ? opts.enum() : opts.enum;

  if (opts.required === false) decorators.push(IsOptional());
  

  decorators.push(buildApiProperty(opts));

  decorators.push(IsEnum(enumValues as any, { each: opts.isArray }));
  if (opts.debug) console.log("added enum validator", enumValues);
  return decorators;
};
