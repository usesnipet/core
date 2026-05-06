import z from "zod";
import { BaseSchema } from "./base";

export const NodeSchema = BaseSchema
  .omit({ metadata: true })
  .extend({ metadata: BaseSchema.shape.metadata.optional() })
  .extend({
    type: z.string(),
    config: z.string().optional(),
  });
export type Node = z.infer<typeof NodeSchema>;
