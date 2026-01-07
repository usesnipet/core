import { KnowledgeEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpGet, HttpPost } from "@/shared/controller/decorators";

import { KnowledgeService } from "./knowledge.service";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";
import { Permission } from "@/lib/permissions";
import { UpdateKnowledgeDto } from "./dto/update-knowledge.dto";
import { HttpBody } from "@/shared/controller/decorators/body";
import { getDefaultFindByIDResponses, getDefaultCreateResponses } from "@/shared/controller/default-response";
import { Param, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { JobStateResponseDto } from "./connector/ingest/dto/job-state.dto";
import { FileIngestDto, FileIngestResponseDto } from "./dto/ingest.dto";

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


  @HttpGet("status/:id", { responses: getDefaultFindByIDResponses(JobStateResponseDto) })
  async getStatus(@Param("id") id: string) {
    return this.service.getStatus(id);
  }

  @HttpPost("", { responses: getDefaultCreateResponses(FileIngestResponseDto) })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  async ingest(@UploadedFile() file: Express.Multer.File, @HttpBody(FileIngestDto) body: FileIngestDto) {
    return this.service.ingest({ ...body, file });
  }
}