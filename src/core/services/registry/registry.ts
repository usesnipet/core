import { ConfigRegistry } from "./config.registry";
import { NodeRegistry } from "./node.registry";
import { FlowRegistry } from "./flow.registry";
import { NodeTypeRegistry } from "./node-type.registry";

export class Registry {
  constructor(
    public readonly config: ConfigRegistry,
    public readonly node: NodeRegistry,
    public readonly nodeType: NodeTypeRegistry,
    public readonly flow: FlowRegistry
  ) {}
}