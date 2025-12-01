
import { Controller, HttpGet, HttpPost } from "@/shared/controller/decorators";
import { HttpBody } from "@/shared/controller/decorators/body";
import { Param, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";

import { ContentService } from "./content.service";
import { IngestDto } from "./dto/ingest.dto";

@Controller("content")
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @HttpGet("status/:id")
  async getStatus(@Param("id") id: string) {
    return this.service.getStatus(id);
  }

  @HttpPost("ingest")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  async ingest(
    @UploadedFile() file: Express.Multer.File,
    @HttpBody(IngestDto) body: IngestDto
  ) {
    return this.service.ingest({ ...body, file });
  }
}