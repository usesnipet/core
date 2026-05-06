import { Flow } from "@/core/schemas/flow";
import { checkIfHasCycle } from "./check-if-has-cicle";

export function validateFlow(flow: Flow, dependencies: Map<string, string[]>): boolean {
  if (checkIfHasCycle(flow, dependencies)) return false;
  return true;
}