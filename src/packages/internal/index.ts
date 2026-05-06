import { PackageSchema } from "@/modules/node/schema";
import { schema } from "./schema";
import { LogNode, SleepNode, FileSystemStorageNode } from "./nodes";

export const InternalPackage = PackageSchema.parse(schema);
export const Nodes = [
  LogNode,
  SleepNode,
  FileSystemStorageNode,
]