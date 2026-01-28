import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from "@nestjs/swagger";

import { FieldClassOptions } from "../types";
import { FromParams, FromQuery, FromBody } from "./source";

export const buildClassDecorators = (opts: FieldClassOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];

  const isRequired = opts.required ?? true;
  const apiMetadata: ApiPropertyOptions = {
    type: () => opts.class(),
    required: isRequired,
    description: opts.description,
    example: opts.example,
    isArray: opts.isArray
  };

  if (opts.required === false) decorators.push(IsOptional());

  const isFromBody = !opts.source || opts.source === "body";

  // Swagger
  decorators.push(isRequired ? ApiProperty(apiMetadata) : ApiPropertyOptional(apiMetadata));

  decorators.push(Type(() => opts.class()));

  decorators.push(ValidateNested({ each: opts.isArray }));

  if (opts.source === "params") decorators.push(FromParams(opts.sourceKey));
  if (opts.source === "query") decorators.push(FromQuery(opts.sourceKey));
  if (isFromBody) decorators.push(FromBody(opts.sourceKey));


  return decorators;
};
