import { FlowNodeRefSchema, FlowSchema } from "../schemas/flow";
import { NodeSchema } from "../schemas/node";

import { RuntimeError } from "./errors/runtime.error";
import { RunnerDef } from "./runner";

export type RuntimeOptions = {
  flow: FlowSchema;
  nodes: Array<NodeSchema & { runner: RunnerDef }>;
  dependencies: Map<string, string[]>;
}

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

export class Runtime {
  state = RuntimeState.READY;
  nodeState = new Map<string, NodeState>();

  get flow(): FlowSchema {
    return this.options.flow;
  }

  get nodes(): Array<NodeSchema & { runner: RunnerDef }> {
    return this.options.nodes;
  }

  get dependencies(): Map<string, string[]> {
    return this.options.dependencies;
  }

  constructor(private readonly options: RuntimeOptions) {}

  private buildInputs(nodeRef: FlowNodeRefSchema): Record<string, unknown> {
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

  private getRunner(nodeId: string): RunnerDef {
    const node = this.nodes.find(node => node.id === nodeId);
    if (!node) throw new RuntimeError(`Node not found: ${nodeId}`);
    return node.runner;
  }

  async run(startNodeId: string) {
    const startNode = this.flow.nodes.find(node => node.instanceId === startNodeId);
    if (!startNode) throw new RuntimeError(`Start node not found: ${startNodeId}`);

    return this.executeNode(startNode, true);
  }

  private async executeNode(nodeRef: FlowNodeRefSchema, force: boolean = false): Promise<void> {
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

      const inputs = this.buildInputs(nodeRef);
      try {
        const runnerDef = this.getRunner(nodeRef.nodeId);
        await runnerDef.execute(
          inputs,
          {
            emit: (name, data) => this.emitFor(nodeRef.instanceId, name, data),
            finish: () => this.finishFor(nodeRef.instanceId),
            executeNode: this.executeNode.bind(this),
            instanceId: nodeRef.instanceId,
            config: nodeRef.config,
          }
        )
        await this.finishFor(nodeRef.instanceId);
      } catch (error) {
        this.nodeState.set(nodeRef.instanceId, { status: "failed", error: error as Error });
      }
    })();

    this.nodeState.set(nodeRef.instanceId, { status: "running", promise });

    return promise;
  }

  private async emitFor(instanceId: string, name: string, data: unknown): Promise<void> {
    const nodeState = this.nodeState.get(instanceId);
    if (!nodeState) throw new RuntimeError(`Node not found: ${instanceId}`);
    if (nodeState.status !== "running") throw new RuntimeError(`Node is not running: ${instanceId}`);
    this.nodeState.set(
      instanceId,
      { ...nodeState, outputs: { ...(nodeState.outputs || {}), [name]: data } }
    );
  }

  private async finishFor(instanceId: string): Promise<void> {
    const nodeState = this.nodeState.get(instanceId);
    if (!nodeState) throw new RuntimeError(`Node not found: ${instanceId}`);
    if (!["running", "completed"].includes(nodeState.status)) throw new RuntimeError(`Node is not running: ${instanceId}`);
    this.nodeState.set(instanceId, { status: "completed", promise: undefined });
  }
}