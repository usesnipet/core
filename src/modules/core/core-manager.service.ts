import { Injectable } from "@nestjs/common";

import { RegistryService } from "./registry.service";

@Injectable()
export class CoreManagerService {
  private rebuilding: Promise<void> | null = null;

  constructor(private readonly bootstrapper: RegistryService) {}

  async reload(): Promise<void> {
    if (this.rebuilding) return this.rebuilding;

    this.rebuilding = this.bootstrapper.rebuildFromDatabase().finally(() => this.rebuilding = null);

    return this.rebuilding;
  }

  snapshot() {
    const registry = this.bootstrapper.getRegistry();
    const nodes = registry.node.list().unwrapOr([]);
    const nodeTypes = registry.nodeType.list().unwrapOr([]);
    const configs = registry.config.list().unwrapOr([]);
    const flows = registry.flow.list().unwrapOr([]);

    return {
      counts: {
        nodes: nodes.length,
        nodeTypes: nodeTypes.length,
        configs: configs.length,
        flows: flows.length,
      },
      ids: {
        nodes: nodes.map((n) => n.id),
        nodeTypes: nodeTypes.map((t) => t.id),
        configs: configs.map((c) => c.id),
        flows: flows.map((f) => f.id),
      },
    };
  }
}

