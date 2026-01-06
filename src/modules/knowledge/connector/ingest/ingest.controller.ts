
import { Controller, HttpGet, HttpPost } from "@/shared/controller/decorators";
import { HttpBody } from "@/shared/controller/decorators/body";
import { Param, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";

import { IngestDto, IngestResponseDto } from "./dto/ingest.dto";
import { IngestService } from "./ingest.service";
import { getDefaultCreateResponses, getDefaultFindByIDResponses } from "@/shared/controller/default-response";
import { JobStateResponseDto } from "./dto/job-state.dto";

@Controller("knowledge/:knowledgeId/connector/:connectorId/ingest")
export class IngestController {
  constructor(private readonly service: IngestService) {}

  @HttpGet("status/:id", { responses: getDefaultFindByIDResponses(JobStateResponseDto) })
  async getStatus(@Param("id") id: string) {
    return this.service.getStatus(id);
  }

  @HttpPost("", { responses: getDefaultCreateResponses(IngestResponseDto) })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  async ingest(
    @UploadedFile() file: Express.Multer.File,
    @HttpBody(IngestDto) body: IngestDto
  ) {
    return this.service.ingest({ ...body, file });
  }
}