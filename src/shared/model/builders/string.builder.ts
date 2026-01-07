import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsUrl, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

import { FieldStringOptions } from "../types";
import { buildApiProperty } from "./api-property";
import { FromParams, FromQuery } from "./context";

export const buildStringDecorators = (opts: FieldStringOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];
  const isFromBody = !opts.source || opts.source === "body"

  // Swagger
  if (isFromBody) decorators.push(buildApiProperty(opts));

  if (opts.required === false) decorators.push(IsOptional());

  // TRANSFORMERS
  if (opts.trim) decorators.push(Transform(({ value }) => value?.trim(), (typeof opts.trim === "object") ? opts.trim : {}));
  if (opts.lowercase) decorators.push(Transform(({ value }) => value?.toLowerCase(), (typeof opts.lowercase === "object") ? opts.lowercase : {}));
  if (opts.uppercase) decorators.push(Transform(({ value }) => value?.toUpperCase(), (typeof opts.uppercase === "object") ? opts.uppercase : {}));

  // VALIDATORS
  if (opts.length) {
    opts.max = opts.max ?? opts.length;
    opts.min = opts.min ?? opts.length;
  }

  if (opts.min) {
    if (typeof opts.min === "object") decorators.push(MinLength(opts.min.length, opts.min));
    else decorators.push(MinLength(opts.min));
  }

  if (opts.max) {
    if (typeof opts.max === "object") decorators.push(MaxLength(opts.max.length, opts.max));
    else decorators.push(MaxLength(opts.max));
  }

  if (opts.email) {
    if (typeof opts.email === "object") {
      const { ...rest } = opts.email;
      decorators.push(IsEmail({ }, rest));
    } else decorators.push(IsEmail());
  }

  if (opts.uuid) {
    decorators.push(IsUUID());
  }

  if (opts.url) {
    if (typeof opts.url === "object") decorators.push(IsUrl(opts.url));
    else decorators.push(IsUrl());
  }

  if (opts.regex) {
    if (typeof opts.regex === "object") decorators.push(Matches(opts.regex.match, opts.regex));
    else decorators.push(Matches(opts.regex));
  }

  if (opts.source === "params") decorators.push(FromParams(opts.sourceKey));
  if (opts.source === "query") decorators.push(FromQuery(opts.sourceKey));

  return decorators;
};
