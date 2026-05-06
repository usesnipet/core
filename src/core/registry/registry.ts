import { ConfigRegistry } from "./config.registry";
import { NodeRegistry } from "./node.registry";
import { FlowRegistry } from "./flow.registry";
import { Flow } from "../schemas/flow";
import { Result, err, ok } from "neverthrow";
import { RegistryError } from "./errors/registry.error";
import { NodeForFlow } from "../types/node-for-flow";

export class Registry {
  constructor(
    public readonly config: ConfigRegistry,
    public readonly node: NodeRegistry,
    public readonly flow: FlowRegistry
  ) {}

  getForFlow(flow: Flow): Result<NodeForFlow[], RegistryError> {
    const nodes: NodeForFlow[] = [];
    for (const node of flow.nodes) {
      const nodeResult = this.node.get(node.nodeId);
      if (nodeResult.isErr()) return err(new RegistryError(`Node not found: ${node.nodeId}`));
      const runnerResult = this.node.getRunner(nodeResult.value.id);
      if (runnerResult.isErr()) return err(new RegistryError(`Runner not found: ${nodeResult.value.id}`));

      nodes.push({
        node: nodeResult.value,
        runner: runnerResult.value
      });
    }
    return ok(nodes);
  }
}