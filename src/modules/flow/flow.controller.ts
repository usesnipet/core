import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { FlowService } from "./flow.service";
import { FlowEntity } from "./flow.entity";
import { CreateFlowDto } from "./dto/create-flow.dto";
import { UpdateFlowDto } from "./dto/update-flow.dto";
import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";

@Controller("flow")
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [FlowEntity], description: "Flows found" })
  async findMany(@Filter() filter: FilterOptions<FlowEntity>): Promise<FlowEntity[]> {
    return this.flowService.findMany(filter);
  }

  @Get(":id")
  @ApiParam({ name: "id", format: "uuid", description: "Flow id" })
  @ApiOkResponse({ type: FlowEntity, description: "Flow found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<FlowEntity | undefined> {
    return this.flowService.findById(id);
  }

  @Post()
  @ApiBody({ type: CreateFlowDto, description: "Create flow" })
  @ApiOkResponse({ type: FlowEntity, description: "Flow created" })
  create(@Body() createFlowDto: CreateFlowDto): Promise<FlowEntity> {
    return this.flowService.create(createFlowDto);
  }

  @Put(":id")
  @ApiBody({ type: UpdateFlowDto, description: "Update flow" })
  @ApiOkResponse({ type: FlowEntity, description: "Flow updated" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() updateFlowDto: UpdateFlowDto): Promise<FlowEntity | undefined> {
    return this.flowService.updateById(id, updateFlowDto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: FlowEntity, description: "Flow deleted" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.flowService.deleteById(id);
    return { deleted };
  }
}