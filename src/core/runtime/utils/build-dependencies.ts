import { Flow } from "@/core/schemas/flow";

export function buildDependencies(flow: Flow) {
  const dependencies = new Map<string, string[]>();

  for (const node of flow.nodes) {
    dependencies.set(node.instanceId, []);
  }

  for (const conn of flow.connections) {
    if (!conn.active) continue;
    dependencies.get(conn.target.instanceId)!.push(conn.source.instanceId);
  }

  return dependencies;
}