import { Registry } from "@/core/services/registry";
import { ConfigRegistry } from "@/core/services/registry/config.registry";
import { FlowRegistry } from "@/core/services/registry/flow.registry";
import { NodeTypeRegistry } from "@/core/services/registry/node-type.registry";
import { NodeRegistry } from "@/core/services/registry/node.registry";
import { Inject, Injectable } from "@nestjs/common";

import { PACKAGES } from "./constants";

import type { PackageRegistry } from "@/packages";

@Injectable()
export class RegistryService extends Registry {
  constructor(
    @Inject(PACKAGES) private readonly packages: PackageRegistry,
  ) {
    super(
      new ConfigRegistry(),
      new NodeRegistry(),
      new NodeTypeRegistry(),
      new FlowRegistry(),
    );
  }

  onModuleInit() {
    this.packages.forEach((pkg) => {
      // config
      pkg.schema.configs.forEach((config) => this.config.register(config));
      // node types
      pkg.schema.nodeTypes.forEach((nodeType) => this.nodeType.register(nodeType));
      // nodes
      pkg.schema.nodes.forEach((node) => this.node.register(node));
      // runners
      pkg.runners.forEach((runner) => this.node.registerRunner(runner.id, runner));
    });
  }
}