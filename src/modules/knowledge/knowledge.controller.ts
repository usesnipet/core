import { KnowledgeEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpGet, HttpPost } from "@/shared/controller/decorators";

import { KnowledgeService } from "./knowledge.service";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";
import { Permission } from "@/lib/permissions";
import { UpdateKnowledgeDto } from "./dto/update-knowledge.dto";
import { getDefaultFindByIDResponses, getDefaultCreateResponses } from "@/shared/controller/default-response";
import { Param, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { FileIngestDto, FileIngestResponseDto } from "./dto/ingest.dto";
import { IngestJobStateResponseDto } from "./dto/job-state.dto";
import { HTTPData } from "@/shared/http-data/http-data.decorator";

@Controller("knowledge")
export class KnowledgeController extends BaseController({
  entity: KnowledgeEntity,
  createDto: CreateKnowledgeDto,
  updateDto: UpdateKnowledgeDto,
  requiredPermissions: {
    create:   [Permission.CREATE_KNOWLEDGE],
    update:   [Permission.UPDATE_KNOWLEDGE],
    delete:   [Permission.DELETE_KNOWLEDGE],
    find:     [Permission.READ_KNOWLEDGE],
    findByID: [Permission.READ_KNOWLEDGE]
  }
}) {
  constructor(public service: KnowledgeService) {
    super(service);
  }

  @HttpGet("status/:id", { responses: getDefaultFindByIDResponses(IngestJobStateResponseDto) })
  async getStatus(@Param("id") id: string) {
    return this.service.getStatus(id);
  }

  @HttpPost(":knowledgeId/ingest", {
    responses: getDefaultCreateResponses(FileIngestResponseDto),
    params: [
      { name: "knowledgeId", type: String, required: true }
    ]
  })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  async ingest(@UploadedFile() file: Express.Multer.File, @HTTPData(FileIngestDto) body: FileIngestDto) {
    return this.service.ingest({ ...body, file });
  }
}