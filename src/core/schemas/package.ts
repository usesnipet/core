import z from "zod";
import { NodeSchema } from "./node";
import { ConfigSchema } from "./config";
import { NodeTypeSchema } from "./node-type";

export const PackageSchema = z.object({
  nodeTypes: z.array(NodeTypeSchema),
  configs: z.array(ConfigSchema),
  nodes: z.array(NodeSchema),
});
export type Package = z.infer<typeof PackageSchema>;