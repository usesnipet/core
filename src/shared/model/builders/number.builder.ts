import { Transform } from "class-transformer";
import { IsInt, IsNegative, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

import { FieldNumberOptions } from "../types";
import { buildApiProperty } from "./api-property";
import { FromBody, FromParams, FromQuery } from "./source";

export const buildNumberDecorators = (opts: FieldNumberOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];

  const isFromBody = !opts.source || opts.source === "body"
  const isOptional = opts.required === false;

  // Swagger
  decorators.push(buildApiProperty(opts));
  if (isOptional) decorators.push(IsOptional());


  decorators.push(Transform(({ value }) => Number(value)));

  decorators.push(IsNumber());

  if (opts.min) {
    if (typeof opts.min === "object") decorators.push(Min(opts.min.min, opts.min as any));
    else decorators.push(Min(opts.min));
  }

  if (opts.max) {
    if (typeof opts.max === "object") decorators.push(Max(opts.max.max, opts.max as any));
    else decorators.push(Max(opts.max));
  }

  if (opts.integer) decorators.push(IsInt());
  if (opts.integer && opts.debug) console.log("added integer validator");
  if (opts.positive) decorators.push(IsPositive());
  if (opts.positive && opts.debug) console.log("added positive validator");
  if (opts.negative) decorators.push(IsNegative());
  if (opts.negative && opts.debug) console.log("added negative validator");

  if (opts.source === "params") decorators.push(FromParams(opts.sourceKey));
  if (opts.source === "query") decorators.push(FromQuery(opts.sourceKey));
  if (isFromBody) decorators.push(FromBody(opts.sourceKey));

  return decorators;
};
