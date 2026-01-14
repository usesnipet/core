import {
  ApiHideProperty, ApiProperty, ApiPropertyOptional, ApiPropertyOptions
} from "@nestjs/swagger";

import { FieldOptions } from "../types";

export const buildApiProperty = (opts: FieldOptions): PropertyDecorator => {
  if (opts.hidden) return ApiHideProperty();

  const isRequired = opts.required ?? true;

  const baseConfig: ApiPropertyOptions = {
    description: opts.description,
    example: opts.example,
    isArray: opts.isArray,
    nullable: opts.nullable,
  };

  switch (opts.type) {
    case "string":
      baseConfig.type = "string";
      let format: string | undefined;
      if (opts.uuid) format = "uuid";
      if (opts.url) format = "uri";
      if (opts.password) format = "password";
      if (opts.email) format = "email";
      if (format) baseConfig.format = format;
      break;
    case "number":
      baseConfig.type = "number";
      break;
    case "boolean":
      baseConfig.type = "boolean";
      break;
    case "date":
      baseConfig.type = Date;
      break;
    case "enum":
      const enumValues = typeof opts.enum === "function" ? opts.enum() : opts.enum;
      baseConfig.enum = enumValues;
      break;
    case "file":
      baseConfig.type = "string";
      baseConfig.format = "binary";
      break;
  }

  if (opts.debug) console.log(baseConfig);
  return isRequired ? ApiProperty(baseConfig) : ApiPropertyOptional(baseConfig);
};
