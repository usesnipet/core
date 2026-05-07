import { Result, err, ok } from "neverthrow";
import { Flow } from "../schemas/flow";
import { Runtime } from "./runtime";
import { Registry } from "../registry/registry";
import { RuntimeError } from "./errors/runtime.error";
import { validateFlow } from "./utils/validate-flow";

export class RuntimeBuilder {
  constructor(private readonly registry: Registry) {}

  build(flow: Flow): Result<Runtime, RuntimeError> {
    const nodesForFlowResult = this.registry.getForFlow(flow);
    if (nodesForFlowResult.isErr()) return err(new RuntimeError("Failed to get nodes for flow"));

    const nodesForFlow = nodesForFlowResult.value;
    if (!validateFlow(flow)) return err(new RuntimeError("Invalid flow"));

    return ok(new Runtime(flow, nodesForFlow));
  }
}