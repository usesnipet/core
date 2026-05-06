import { z } from "zod";

export const BaseSchema = z.object({
  id: z.string(),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    docs: z.string().optional(),
    icon: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
  })
});