import { FieldFileOptions } from "../types";
import { Exclude } from "class-transformer";

export const buildFileDecorators = (opts: FieldFileOptions): PropertyDecorator[] => {
  const decorators: PropertyDecorator[] = [];
  decorators.push(Exclude());

  return decorators;
};
