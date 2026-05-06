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

export const ConfigSchema = BaseSchema.extend({
  fields: z.record(z.string(), FieldSchema),
});
export type Config = z.infer<typeof ConfigSchema>;

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

export const NodeSchema = BaseSchema
  .omit({ metadata: true })
  .extend({ metadata: BaseSchema.shape.metadata.optional() })
  .extend({
    type: z.string(),
    config: z.string().optional(),
  });
export type Node = z.infer<typeof NodeSchema>;

export const PackageSchema = z.object({
  nodeTypes: z.array(NodeTypeSchema),
  configs: z.array(ConfigSchema),
  nodes: z.array(NodeSchema),
});
export type Package = z.infer<typeof PackageSchema>;