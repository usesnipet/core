import { Flow } from "@/core/schemas/flow";
import { checkIfHasCycle } from "./check-if-has-cicle";
import { buildDependencies } from "./build-dependencies";

export function validateFlow(
  flow: Flow,
  dependencies: Map<string, string[]> = buildDependencies(flow)
): boolean {
  if (checkIfHasCycle(flow, dependencies)) return false;
  return true;
}