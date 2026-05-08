import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { NodeTypeEntity } from "./node-type.entity";
import { NodeTypeService } from "./node-type.service";
import { CreateNodeTypeDto } from "./dto/create-node-type.dto";
import { UpdateNodeTypeDto } from "./dto/update-node-type.dto";

@Controller("node-type")
export class NodeTypeController {
  constructor(private readonly nodeTypeService: NodeTypeService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [NodeTypeEntity], description: "Node types found" })
  async findMany(@Filter() filter: FilterOptions<NodeTypeEntity>): Promise<NodeTypeEntity[]> {
    return this.nodeTypeService.findMany(filter);
  }

  @Get(":id")
  @ApiParam({ name: "id", format: "uuid", description: "Node type id" })
  @ApiOkResponse({ type: NodeTypeEntity, description: "Node type found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<NodeTypeEntity | undefined> {
    return this.nodeTypeService.findById(id);
  }

  @Post()
  @ApiBody({ type: CreateNodeTypeDto, description: "Create node type" })
  @ApiOkResponse({ type: NodeTypeEntity, description: "Node type created" })
  create(@Body() dto: CreateNodeTypeDto): Promise<NodeTypeEntity> {
    return this.nodeTypeService.create(dto);
  }

  @Put(":id")
  @ApiBody({ type: UpdateNodeTypeDto, description: "Update node type" })
  @ApiOkResponse({ type: NodeTypeEntity, description: "Node type updated" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateNodeTypeDto): Promise<NodeTypeEntity | undefined> {
    return this.nodeTypeService.updateById(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Node type deleted" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.nodeTypeService.deleteById(id);
    return { deleted };
  }
}

