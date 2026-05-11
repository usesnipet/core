import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { NodeDto } from "./dto/node.dto";
import { NodeService } from "./node.service";

@Controller("node")
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [NodeDto], description: "Nodes found" })
  async findMany(@Filter() filter: FilterOptions<NodeDto>): Promise<NodeDto[]> {
    return this.nodeService.find(filter);
  }
}

