

import { FieldFileOptions } from "../types";
import { buildApiProperty } from "./api-property";

export const buildFileDecorators = (opts: FieldFileOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];
  decorators.push(buildApiProperty(opts));

  return decorators;
};
