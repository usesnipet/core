import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { NodeEntity } from "./node.entity";
import { NodeService } from "./node.service";
import { CreateNodeDto } from "./dto/create-node.dto";
import { UpdateNodeDto } from "./dto/update-node.dto";

@Controller("node")
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [NodeEntity], description: "Nodes found" })
  async findMany(@Filter() filter: FilterOptions<NodeEntity>): Promise<NodeEntity[]> {
    return this.nodeService.findMany(filter);
  }

  @Get(":id")
  @ApiParam({ name: "id", format: "uuid", description: "Node id" })
  @ApiOkResponse({ type: NodeEntity, description: "Node found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<NodeEntity | undefined> {
    return this.nodeService.findById(id);
  }

  @Post()
  @ApiBody({ type: CreateNodeDto, description: "Create node" })
  @ApiOkResponse({ type: NodeEntity, description: "Node created" })
  create(@Body() dto: CreateNodeDto): Promise<NodeEntity> {
    return this.nodeService.create(dto);
  }

  @Put(":id")
  @ApiBody({ type: UpdateNodeDto, description: "Update node" })
  @ApiOkResponse({ type: NodeEntity, description: "Node updated" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateNodeDto): Promise<NodeEntity | undefined> {
    return this.nodeService.updateById(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Node deleted" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.nodeService.deleteById(id);
    return { deleted };
  }
}

