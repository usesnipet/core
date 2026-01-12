import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

import { FieldBooleanOptions } from "../types";
import { buildApiProperty } from "./api-property";
import { FromBody, FromParams, FromQuery } from "./source";

export const buildBooleanDecorators = (opts: FieldBooleanOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];
  const isFromBody = !opts.source || opts.source === "body";

  // Swagger
  decorators.push(buildApiProperty(opts));
  if (opts.required === false) decorators.push(IsOptional());


  // TRANSFORM: convert "true"/"false"/1/0/etc in boolean
  decorators.push(
    Transform(({ value }) => {
      if (typeof value === "boolean") return value;
      if (value === "true" || value === "1") return true;
      if (value === "false" || value === "0") return false;
      return Boolean(value);
    })
  );

  // VALIDATION
  decorators.push(IsBoolean());
  decorators.push(FromBody());

  if (opts.source === "params") decorators.push(FromParams(opts.sourceKey));
  if (opts.source === "query") decorators.push(FromQuery(opts.sourceKey));
  if (isFromBody) decorators.push(FromBody(opts.sourceKey));

  return decorators;
};
