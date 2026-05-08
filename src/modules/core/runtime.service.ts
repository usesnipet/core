import { Runtime } from "@/core/runtime";
import { RuntimeError } from "@/core/runtime/errors/runtime.error";
import { Flow } from "@/core/schemas/flow";
import { RuntimeBuilderService } from "@/core/services/runtime-builder.service";
import { FlowService } from "@/modules/flow/flow.service";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { randomUUID } from "crypto";

import { RegistryService } from "./registry.service";
import { RuntimeStore } from "./runtime-store";

@Injectable()
export class RuntimeService {
  constructor(
    private readonly registry: RegistryService,
    private readonly flowService: FlowService,
    private readonly store: RuntimeStore,
  ) {}

  async createFromFlowId(flowId: string, runtimeId?: string) {
    const flowEntity = await this.flowService.findById(flowId);
    if (!flowEntity) throw new RuntimeError(`Flow not found: ${flowId}`);
    const flow = plainToInstance(Flow, { id: flowEntity.id, ...(flowEntity.code as any) });
    return this.createFromFlow(flow, runtimeId, flowEntity.id);
  }

  async createFromFlowCode(flowCode: Record<string, unknown>, runtimeId?: string) {
    const flow = plainToInstance(Flow, flowCode as any);
    if (!flow.id) {
      (flow as any).id = `flow:${randomUUID()}`;
    }
    return this.createFromFlow(flow, runtimeId);
  }

  private async createFromFlow(flow: Flow, runtimeId?: string, flowId?: string) {
    const builder = new RuntimeBuilderService(this.registry.getRegistry());
    const result = builder.build(flow);
    if (result.isErr()) throw new RuntimeError("Failed to build runtime", result.error);

    const id = runtimeId ?? `rt:${randomUUID()}`;
    const runtime: Runtime = result.value;
    this.store.set({ id, createdAt: new Date(), runtime, flowId });
    return { id, flowId: flowId ?? flow.id };
  }

  get(id: string) {
    const entry = this.store.get(id);
    if (!entry) return undefined;
    return {
      id: entry.id,
      createdAt: entry.createdAt,
      flowId: entry.flowId,
      state: entry.runtime.state,
      nodeState: Array.from(entry.runtime.nodeState.entries()).map(([instanceId, state]) => ({
        instanceId,
        status: state.status,
        outputs: state.outputs ?? {},
        error: state.error ? { message: state.error.message, name: state.error.name } : undefined,
      })),
    };
  }

  async run(id: string, startNodeInstanceId: string) {
    const entry = this.store.get(id);
    if (!entry) throw new Error(`Runtime not found: ${id}`);
    await entry.runtime.run(startNodeInstanceId);
    return this.get(id);
  }
}

