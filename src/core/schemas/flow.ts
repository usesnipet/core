import z from "zod";
import { BaseSchema } from "./base";

export const FlowSchema = BaseSchema.extend({
  nodes: z.array(z.object({
    instanceId: z.string(),
    nodeId: z.string(),
    config: z.record(z.string(), z.unknown()).optional(),
  })),
  connections: z.array(z.object({
    source: z.object({
      instanceId: z.string(),
      outputId: z.string(),
    }),
    target: z.object({
      instanceId: z.string(),
      inputId: z.string(),
    }),
    active: z.boolean(),
  }))
});
export type Flow = z.infer<typeof FlowSchema>;