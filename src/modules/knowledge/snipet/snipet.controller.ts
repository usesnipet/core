import { SnipetEntity, SnipetMemoryEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, Filter, HttpGet, HttpPost } from "@/shared/controller/decorators";
import { CreateOrUpdateSnipetDto } from "./dto/create-or-update-snipet.dto";
import { SnipetService } from "./snipet.service";
import { Permission } from "@/lib/permissions";
import { HttpBody } from "@/shared/controller/decorators/body";
import { ExecuteSnipetDto, ExecuteSnipetResponseDto } from "./dto/execute-snipet.dto";
import { Sse } from "@nestjs/common";
import { ApiParam, ApiProduces } from "@nestjs/swagger";
import { map, Observable } from "rxjs";
import { StreamDto } from "./dto/stream.dto";
import { getDefaultCreateResponses, getDefaultFindResponses } from "@/shared/controller/default-response";
import { As, ReadMemoryAsChatDto, ReadMemoryAsDto } from "./dto/read-memory-as.dto";
import { FilterOptions } from "@/shared/filter-options";

@Controller("knowledge/:knowledgeId/snipet")
export class SnipetController extends BaseController({
  entity: SnipetEntity,
  createDto: CreateOrUpdateSnipetDto,
  updateDto: CreateOrUpdateSnipetDto,
  requiredPermissions: {
    create:   [Permission.CREATE_SNIPET],
    update:   [Permission.UPDATE_SNIPET],
    delete:   [Permission.DELETE_SNIPET],
    find:     [Permission.READ_SNIPET],
    findByID: [Permission.READ_SNIPET]
  }
}) {
  constructor(public service: SnipetService) {
    super(service);
  }

  @HttpPost(":snipetId/execute", {
    params: [ { name: "snipetId", description: "The id of the snipet to execute", required: true } ],
    responses: getDefaultCreateResponses(ExecuteSnipetResponseDto)
  })
  execute(@HttpBody(ExecuteSnipetDto) data: ExecuteSnipetDto): ExecuteSnipetResponseDto {
    return this.service.execute(data);
  }

  @ApiProduces("text/event-stream")
  @ApiParam({ name: "snipetId", description: "The id of the snipet to stream", required: true })
  @ApiParam({ name: "id", description: "Execution ID", required: true })
  @Sse(":snipetId/stream/:id")
  async stream(@HttpBody(StreamDto) data: StreamDto): Promise<Observable<any>> {
    const stream = await this.service.stream(data.executionId);
    return stream.pipe(map(v => ({ data: v })));
  }

  @HttpGet(":snipetId/read-as", {
    params: [ { name: "snipetId", description: "The id of the snipet to read", required: true } ],
    query: [ { name: "as", description: "The role to read the snipet as", required: true, enum: As } ],
    responses: getDefaultFindResponses(ReadMemoryAsChatDto)
  })
  async readMemoryAs(
    @HttpBody(ReadMemoryAsDto) data: ReadMemoryAsDto,
    @Filter() filterOpts: FilterOptions<SnipetMemoryEntity>
  ) {
    return this.service.readMemoryAs(filterOpts, data);
  }
}