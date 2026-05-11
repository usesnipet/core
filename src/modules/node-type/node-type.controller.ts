import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { NodeType } from "./models/node-type.model";
import { NodeTypeService } from "./node-type.service";

@Controller("node-type")
export class NodeTypeController {
  constructor(private readonly nodeTypeService: NodeTypeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [NodeType], description: "Node types found" })
  async findMany(@Filter() filter: FilterOptions<NodeType>): Promise<NodeType[]> {
    return this.nodeTypeService.find(filter);
  }
}
