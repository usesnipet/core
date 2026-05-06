import { z } from "zod";
import { FieldSchema } from "./field";
import { BaseSchema } from "./base";

export const NodeTypeSchema = BaseSchema.extend({
  inputs: z.record(z.string(), FieldSchema).optional(),
  outputs: z.record(z.string(), FieldSchema).optional(),

  components: z
    .record(
      z.string(),
      z.object({
        type: z.string(),
        required: z.boolean().optional(),
      })
    )
    .optional(),
});
export type NodeType = z.infer<typeof NodeTypeSchema>;
