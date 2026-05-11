import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { Node } from "./models/node.model";
import { NodeService } from "./node.service";

@Controller("node")
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Node], description: "Nodes found" })
  async findMany(@Filter() filter: FilterOptions<Node>): Promise<Node[]> {
    return this.nodeService.find(filter);
  }
}
