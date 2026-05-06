import z from "zod";

export type Field = {
  type: string;
  description: string;
  required?: boolean;
  defaultValue?: unknown;
  items?: Field;
  properties?: Record<string, Field>;
  encrypted?: boolean;
};

export const FieldSchema: z.ZodType<Field> = z.lazy(() =>
  z.object({
    type: z.string(),
    description: z.string(),
    required: z.boolean().optional(),
    defaultValue: z.unknown().optional(),
    items: FieldSchema.optional(),
    properties: z.record(z.string(), FieldSchema).optional(),
    encrypted: z.boolean().optional(),
  })
);