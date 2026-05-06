import { z } from "zod";
import { BaseSchema } from "./base";
import { FieldSchema } from "./field";

export const ConfigSchema = BaseSchema.extend({
  fields: z.record(z.string(), FieldSchema),
});
export type Config = z.infer<typeof ConfigSchema>;
