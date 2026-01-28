import { SnipetEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpPost } from "@/shared/controller/decorators";
import { CreateOrUpdateSnipetDto } from "./dto/create-or-update-snipet.dto";
import { SnipetService } from "./snipet.service";
import { Permission } from "@/lib/permissions";
import { ExecuteSnipetDto, ExecuteSnipetResponseDto } from "./dto/execute-snipet.dto";
import { Sse } from "@nestjs/common";
import { ApiProduces } from "@nestjs/swagger";
import { map, Observable } from "rxjs";
import { StreamDto } from "./dto/stream.dto";
import { getDefaultCreateResponses } from "@/shared/controller/default-response";
import { HTTPData } from "@/shared/http-data/http-data.decorator";
import { HTTPDataSwagger } from "@/shared/http-data/http-data-swagger.decorator";

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
  @HTTPDataSwagger(ExecuteSnipetDto)
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
}