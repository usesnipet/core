import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";

import { CreateRuntimeDto, RunRuntimeDto } from "./dto/create-runtime.dto";
import { RuntimeService } from "./runtime.service";

@ApiTags("runtime")
@Controller("runtime")
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  @Post()
  @ApiBody({ type: CreateRuntimeDto })
  @ApiOkResponse({ description: "Runtime created" })
  async create(@Body() dto: CreateRuntimeDto) {
    if (dto.flowId) {
      return this.runtimeService.createFromFlowId(dto.flowId, dto.id);
    }
    return this.runtimeService.createFromFlowCode(dto.flowCode!, dto.id);
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ description: "Runtime status" })
  get(@Param("id") id: string) {
    const runtime = this.runtimeService.get(id);
    return runtime ?? { id, missing: true };
  }

  @Post(":id/run")
  @ApiParam({ name: "id", required: true })
  @ApiBody({ type: RunRuntimeDto })
  @ApiOkResponse({ description: "Runtime executed" })
  run(@Param("id") id: string, @Body() dto: RunRuntimeDto) {
    return this.runtimeService.run(id, dto.startNodeInstanceId);
  }
}

