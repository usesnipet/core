import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from "@nestjs/swagger";

import { FieldClassOptions } from "../types";

export const buildClassDecorators = (opts: FieldClassOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];

  const isRequired = opts.required ?? true;
  const apiMetadata: ApiPropertyOptions = {
    type: () => opts.class(),
    required: isRequired,
    description: opts.description,
    example: opts.example,
    default: opts.default,
    isArray: opts.isArray
  };

  if (opts.required === false) decorators.push(IsOptional());
  

  if (opts.debug) console.log(apiMetadata);
  decorators.push(isRequired ? ApiProperty(apiMetadata) : ApiPropertyOptional(apiMetadata));
  if (opts.debug) console.log("added api property");

  decorators.push(Type(() => opts.class()));
  if (opts.debug) console.log("added type");

  decorators.push(ValidateNested({ each: opts.isArray }));
  if (opts.debug) console.log("added validate nested");
  return decorators;
};
