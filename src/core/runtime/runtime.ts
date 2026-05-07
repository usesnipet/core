import { Flow, FlowNodeRef } from "../schemas/flow";
import { Constructable } from "../types/constructable";
import { IRunner } from "../types/node";
import { NodeForFlow } from "../types/node-for-flow";
import { ExecutionResult, IRuntime } from "../types/runtime";
import { RuntimeError } from "./errors/runtime.error";
import { buildDependencies } from "./utils/build-dependencies";

export enum RuntimeState {
  READY,
  RUNNING,
  PAUSED,
  STOPPED,
}

export type NodeState = {
  status: "pending" | "running" | "completed" | "failed";
  promise?: Promise<void>;
  outputs?: Record<string, unknown>;
  error?: Error;
}

export class Runtime implements IRuntime {
  state = RuntimeState.READY;
  nodeState = new Map<string, NodeState>();

  private dependencies = new Map<string, string[]>();

  constructor(
    private readonly flow: Flow,
    private readonly nodeForFlow: NodeForFlow[],
  ) {
    this.dependencies = buildDependencies(this.flow);
  }

  private buildInputs(nodeRef: FlowNodeRef): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    for (const conn of this.flow.connections) {
      if (!conn.active) continue;
      if (conn.target.instanceId !== nodeRef.instanceId) continue;
      const sourceNodeState = this.nodeState.get(conn.source.instanceId);
      if (!sourceNodeState) continue;
      if (sourceNodeState.status !== "completed") {
        throw new RuntimeError(`Node is not completed: ${conn.source.instanceId}`);
      }
      inputs[conn.target.inputId] = sourceNodeState.outputs![conn.source.outputId];
    }
    return inputs;
  }

  private getRunner(nodeId: string): Constructable<IRunner> {
    const node = this.nodeForFlow.find(node => node.node.id === nodeId);
    if (!node) throw new RuntimeError(`Node not found: ${nodeId}`);
    return node.runner;
  }

  async run(startNodeId: string) {
    const startNode = this.flow.nodes.find(node => node.instanceId === startNodeId);
    if (!startNode) throw new RuntimeError(`Start node not found: ${startNodeId}`);

    return this.executeNode(startNode, true);
  }

  async executeNode(nodeRef: FlowNodeRef, force: boolean = false): Promise<void> {
    const nodeState = this.nodeState.get(nodeRef.instanceId);
    if (nodeState?.status === "running") return nodeState.promise;
    if (nodeState?.status === "completed" && !force) return;
    const promise = (async () => {
      const dependencies = this.dependencies.get(nodeRef.instanceId);
      if (dependencies && dependencies.length > 0) {
        await Promise.all(
          dependencies.map(dependency =>
            this.executeNode(this.flow.nodes.find(node => node.instanceId === dependency)!)
          )
        );
      }
      const runner = this.getRunner(nodeRef.nodeId);
      const instance = new runner(this);
      const inputs = this.buildInputs(nodeRef);
      try {
        return instance.execute(inputs, nodeRef.config);
      } catch (error) {
        this.nodeState.set(nodeRef.instanceId, { status: "failed", error: error as Error });
      }
    })();

    this.nodeState.set(nodeRef.instanceId, { status: "running", promise });

    return promise;
  }

  async emit(instanceId: string, name: string, data: unknown): Promise<void> {
    const nodeState = this.nodeState.get(instanceId);
    if (!nodeState) throw new RuntimeError(`Node not found: ${instanceId}`);
    if (nodeState.status !== "running") throw new RuntimeError(`Node is not running: ${instanceId}`);
    this.nodeState.set(
      instanceId,
      { ...nodeState, outputs: { ...(nodeState.outputs || {}), [name]: data } }
    );
  }

  async finish(instanceId: string): Promise<void> {
    const nodeState = this.nodeState.get(instanceId);
    if (!nodeState) throw new RuntimeError(`Node not found: ${instanceId}`);
    if (nodeState.status !== "running") throw new RuntimeError(`Node is not running: ${instanceId}`);
    this.nodeState.set(instanceId, { status: "completed", promise: undefined });
  }
}