import { err, ok, Result } from "neverthrow";

import { Runtime, RuntimeOptions } from "../runtime";
import { RuntimeError } from "../runtime/errors/runtime.error";
import { FlowSchema } from "../schemas/flow";

import { Registry } from "./registry";

export class RuntimeBuilderService {
  constructor(private readonly registry: Registry) {}

  build(flow: FlowSchema): Result<Runtime, RuntimeError> {
    // validate flow
    const dependencies = this.buildDependencies(flow);

    // check if flow has cycle using the dependencies
    if (this.checkIfHasCycle(flow, dependencies)) return err(new RuntimeError("Flow has a cycle"));

    // check if output and input types are matching
    const outInMatchingResult = this.checkOutInMatching(flow);
    if (outInMatchingResult.isErr()) {
      return err(new RuntimeError("Output and input types do not match", outInMatchingResult.error));
    }

    // check if has all nodes registered
    const allNodesRegisteredResult = this.checkAllNodesRegistered(flow);
    if (allNodesRegisteredResult.isErr()) {
      return err(new RuntimeError("All nodes are not registered", allNodesRegisteredResult.error));
    }

    // build nodes
    const nodes: RuntimeOptions["nodes"] = [];
    for (const node of flow.nodes) {
      const nodeResult = this.registry.node.get(node.nodeId);
      if (nodeResult.isErr()) {
        return err(new RuntimeError(`Node not found: ${node.nodeId}`, nodeResult.error));
      }

      const runnerResult = this.registry.node.getRunner(nodeResult.value.id);
      if (runnerResult.isErr()) {
        return err(new RuntimeError(`Runner not found: ${nodeResult.value.id}`, runnerResult.error));
      }

      nodes.push({ ...nodeResult.value, runner: runnerResult.value });
    }

    return ok(new Runtime({ flow, dependencies, nodes }));
  }

  /**
   * Build the dependencies of the flow
   * @param flow - The flow to build the dependencies for
   * @returns A Map containing the dependencies of the flow
   */
  private buildDependencies(flow: FlowSchema): Map<string, string[]> {
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

  /**
   * Check if the flow has a cycle
   * @param flow - The flow to check
   * @param dependencies - The dependencies of the flow
   * @returns A boolean indicating if the flow has a cycle
   */
  private checkIfHasCycle(
    flow: FlowSchema,
    dependencies: Map<string, string[]> = this.buildDependencies(flow)
  ): boolean {
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

  /**
   * Check if the output and input types are matching
   * @param flow - The flow to check
   * @returns A Result containing void if the output and input types are matching, otherwise a RuntimeError
   */
  private checkOutInMatching(flow: FlowSchema): Result<void, RuntimeError> {
    for (const conn of flow.connections) {
      if (!conn.active) continue;
      const sourceNode = flow.nodes.find(node => node.instanceId === conn.source.instanceId);
      if (!sourceNode) return err(new RuntimeError(`Source node not found: ${conn.source.instanceId}`));

      const targetNode = flow.nodes.find(node => node.instanceId === conn.target.instanceId);
      if (!targetNode) return err(new RuntimeError(`Target node not found: ${conn.target.instanceId}`));

      const sourceNodeTypeResult = this.registry.nodeType.get(sourceNode.nodeId);
      if (sourceNodeTypeResult.isErr()) return err(new RuntimeError(`Source node type not found: ${sourceNode.nodeId}`));

      const targetNodeTypeResult = this.registry.nodeType.get(targetNode.nodeId);
      if (targetNodeTypeResult.isErr()) return err(new RuntimeError(`Target node type not found: ${targetNode.nodeId}`));

      const sourceNodeType = sourceNodeTypeResult.value;
      const targetNodeType = targetNodeTypeResult.value;
      const sourceOutput = sourceNodeType.outputs?.[conn.source.outputId];
      const targetInput = targetNodeType.inputs?.[conn.target.inputId];
      if (!sourceOutput || !targetInput) {
        return err(new RuntimeError(`Output or input not found: ${conn.source.outputId} or ${conn.target.inputId}`));
      }
      if (sourceOutput.type !== targetInput.type) {
        return err(new RuntimeError(`Output and input types do not match: ${sourceOutput.type} !== ${targetInput.type}`));
      }
    }
    return ok(undefined);
  }

  /**
   * Check if all nodes are registered
   * @param flow - The flow to check
   * @returns A Result containing void if all nodes are registered, otherwise a RuntimeError
   */
  private checkAllNodesRegistered(flow: FlowSchema): Result<void, RuntimeError> {
    const nodeIds = flow.nodes.map(node => node.nodeId);
    const registeredNodesResult = this.registry.node.list();
    if (registeredNodesResult.isErr()) return err(new RuntimeError("Failed to get registered nodes"));
    const registeredNodes = registeredNodesResult.value;
    for (const id of nodeIds) {
      if (!registeredNodes.some(n => n.id === id)) return err(new RuntimeError(`Node not found: ${id}`));
    }
    return ok(undefined);
  }
}
