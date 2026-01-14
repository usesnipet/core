import { SnipetEntity, SnipetMemoryEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, Filter, HttpGet, HttpPost } from "@/shared/controller/decorators";
import { CreateOrUpdateSnipetDto } from "./dto/create-or-update-snipet.dto";
import { SnipetService } from "./snipet.service";
import { Permission } from "@/lib/permissions";
import { ExecuteSnipetDto, ExecuteSnipetResponseDto } from "./dto/execute-snipet.dto";
import { Sse } from "@nestjs/common";
import { ApiParam, ApiProduces } from "@nestjs/swagger";
import { map, Observable } from "rxjs";
import { StreamDto } from "./dto/stream.dto";
import { getDefaultCreateResponses, getDefaultFindResponses } from "@/shared/controller/default-response";
import { ReadMemoryAsChatDto, ReadMemoryAsDto } from "./dto/read-memory-as.dto";
import { FilterOptions } from "@/shared/filter-options";
import { HTTPData } from "@/shared/http-data/http-data.decorator";
import { HTTPDataSwagger } from "@/shared/http-data/http-data-swagger.decorator";
import { ExecutionEntity } from "@/entities/execution.entity";

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

  @HttpPost(":snipetId/execute", { responses: getDefaultCreateResponses(ExecuteSnipetResponseDto) })
  @HTTPDataSwagger(ExecutionEntity)
  execute(@HTTPData(ExecuteSnipetDto) data: ExecuteSnipetDto): Promise<ExecuteSnipetResponseDto> {
    return this.service.execute(data);
  }

  @ApiProduces("text/event-stream")
  @Sse(":snipetId/stream/:id")
  @HTTPDataSwagger(StreamDto)
  async stream(@HTTPData(StreamDto) data: StreamDto): Promise<Observable<any>> {
    const stream = await this.service.stream(data.executionId);
    return stream.pipe(map(v => ({ data: v })));
  }

  @HttpGet(":snipetId/read-as", { responses: getDefaultFindResponses(ReadMemoryAsChatDto, false) })
  @HTTPDataSwagger(ReadMemoryAsDto)
  async readMemoryAs(
    @HTTPData(ReadMemoryAsDto) data: ReadMemoryAsDto, @Filter() filterOpts: FilterOptions<SnipetMemoryEntity>
  ) {
    return this.service.readMemoryAs(filterOpts, data);
  }
}