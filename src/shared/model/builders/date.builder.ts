import { Transform } from "class-transformer";
import { IsDate, IsOptional, MaxDate, MinDate } from "class-validator";
import moment from "moment";

import { FieldDateOptions } from "../types";
import { buildApiProperty } from "./api-property";
import { FromBody, FromParams, FromQuery } from "./source";

export const buildDateDecorators = (opts: FieldDateOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];
  const isFromBody = !opts.source || opts.source === "body"

  // Swagger
  if (isFromBody) decorators.push(buildApiProperty(opts));
  if (opts.required === false) decorators.push(IsOptional());
  

  // TRANSFORM: allow transforming string to Date
  decorators.push(
    Transform(({ value }) => {
      if (value instanceof Date) return value;
      if (!value) return value;
      return moment(value).toDate();
    })
  );
  if (opts.debug) console.log("added date transformer");

  // VALIDATION
  decorators.push(IsDate());

  if (opts.minDate) {
    decorators.push(MinDate(new Date(opts.minDate)));
    if (opts.debug) console.log("added min date validator");
  }

  if (opts.maxDate) {
    decorators.push(MaxDate(new Date(opts.maxDate)));
    if (opts.debug) console.log("added max date validator");
  }

  if (opts.source === "params") decorators.push(FromParams(opts.sourceKey));
  if (opts.source === "query") decorators.push(FromQuery(opts.sourceKey));
  if (isFromBody) decorators.push(FromBody(opts.sourceKey));
  
  return decorators;
};
