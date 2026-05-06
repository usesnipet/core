import { Flow } from "@/core/schemas/flow";

export function checkIfHasCycle(flow: Flow, dependencies: Map<string, string[]>): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

  const visit = (id: string): boolean => {
    if (stack.has(id)) return true;
    if (visited.has(id)) return false;

    visited.add(id);
    stack.add(id);

    for (const dep of dependencies.get(id) || []) {
      if (visit(dep)) return true;
    }

    stack.delete(id);
    return false;
  };
  const nodeIds = flow.nodes.map(node => node.instanceId);

  return nodeIds.some(id => visit(id));
}