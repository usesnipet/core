import { Runner, RunnerOptions } from "@/core/runtime/runner";
import { Config } from "@/core/schemas/config";
import { Flow } from "@/core/schemas/flow";
import { Node } from "@/core/schemas/node";
import { NodeType } from "@/core/schemas/node-type";
import { ConfigRegistry } from "@/core/services/registry/config.registry";
import { FlowRegistry } from "@/core/services/registry/flow.registry";
import { NodeTypeRegistry } from "@/core/services/registry/node-type.registry";
import { NodeRegistry } from "@/core/services/registry/node.registry";
import { Registry } from "@/core/services/registry/registry";
import { ConfigService } from "@/modules/config/config.service";
import { FlowService } from "@/modules/flow/flow.service";
import { NodeTypeService } from "@/modules/node-type/node-type.service";
import { NodeService } from "@/modules/node/node.service";
import { Constructable } from "@/types";
import { Inject, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

import { CORE_RUNNER_CATALOG } from "./core.constants";

export type RunnerCatalog = Array<Constructable<Runner, [RunnerOptions]>>;

@Injectable()
export class RegistryService {
  constructor(
    private registry: Registry,
    @Inject(CORE_RUNNER_CATALOG) private readonly runners: RunnerCatalog,
    private readonly flowService: FlowService,
    private readonly nodeService: NodeService,
    private readonly nodeTypeService: NodeTypeService,
    private readonly configService: ConfigService,
  ) {}

  getRegistry(): Registry {
    return this.registry;
  }

  async clear(): Promise<void> {
    this.registry = new Registry(
      new ConfigRegistry(),
      new NodeRegistry(),
      new NodeTypeRegistry(),
      new FlowRegistry(),
    );
  }

  async rebuildFromDatabase(): Promise<void> {

    const [flows, nodes, nodeTypes, configs] = await Promise.all([
      this.flowService.findMany({}),
      this.nodeService.findMany({}),
      this.nodeTypeService.findMany({}),
      this.configService.findMany({}),
    ]);

    for (const f of flows) {
      const flow = plainToInstance(Flow, { id: f.id, ...(f.code as any) });
      await this.registry.flow.register(flow);
    }

    for (const nt of nodeTypes) {
      const nodeType = plainToInstance(NodeType, {
        id: nt.typeId,
        metadata: {
          name: nt.name,
          description: nt.description ?? "",
          docs: nt.docs ?? undefined,
          icon: nt.icon ?? undefined,
          author: nt.author ?? undefined,
        },
        inputs: nt.inputs ?? {},
        outputs: nt.outputs ?? {},
        components: nt.components ?? {},
      });
      await this.registry.nodeType.register(nodeType);
    }

    for (const c of configs) {
      const config = plainToInstance(Config, {
        id: c.configId,
        metadata: {
          name: c.name,
          description: c.description ?? "",
          docs: c.docs ?? undefined,
          icon: c.icon ?? undefined,
          author: c.author ?? undefined,
        },
        fields: c.fieldSchema ?? {},
      });
      await this.registry.config.register(config);
    }

    for (const n of nodes) {
      const node = plainToInstance(Node, {
        id: n.nodeId,
        metadata: {
          name: n.name,
          description: n.description ?? "",
          docs: n.docs ?? undefined,
          icon: n.icon ?? undefined,
          author: n.author ?? undefined,
        },
        type: n.nodeTypeId, // important: Node.type points to NodeType.id (typeId)
        config: n.configId ?? undefined, // important: Node.config points to Config.id (configId)
      });
      await this.registry.node.register(node);
    }

    // register runners (by runner.id -> node.id)
    for (const RunnerCls of this.runners) {
      const inst = new RunnerCls({
        instanceId: "__bootstrap__",
        config: {},
        emit: async () => {},
        finish: async () => {},
        executeNode: async () => {},
      });
      const runnerId = (inst as any).id as string | undefined;
      if (!runnerId) continue;
      this.registry.node.registerRunner(runnerId, RunnerCls);
    }
  }
}

