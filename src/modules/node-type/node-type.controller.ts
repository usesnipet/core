import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { NodeTypeDto } from "./dto/node-type.dto";
import { NodeTypeService } from "./node-type.service";

@Controller("node-type")
export class NodeTypeController {
  constructor(private readonly nodeTypeService: NodeTypeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [NodeTypeDto], description: "Node types found" })
  async findMany(@Filter() filter: FilterOptions<NodeTypeDto>): Promise<NodeTypeDto[]> {
    return this.nodeTypeService.find(filter);
  }
}
