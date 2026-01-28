import { Allow, IsOptional } from "class-validator";

import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from "@nestjs/swagger";

import { FieldObjectOptions } from "../types";

export const buildObjectDecorators = (opts: FieldObjectOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];

  const isRequired = opts.required ?? true;
  if (opts.required === false) decorators.push(IsOptional());


  const apiMetadata: ApiPropertyOptions = {
    required: isRequired,
    description: opts.description,
    example: opts.example,
    isArray: opts.isArray,
    additionalProperties: opts.additionalProperties
  };
  decorators.push(Allow({ each: opts.isArray }));
  decorators.push(isRequired ? ApiProperty(apiMetadata) : ApiPropertyOptional(apiMetadata));

  return decorators;
};
