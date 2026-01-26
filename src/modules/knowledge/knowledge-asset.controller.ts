import { BaseController } from "@/shared/controller";
import { KnowledgeAssetEntity } from "./asset/knowledge-asset.entity";
import { KnowledgeAssetService } from "./knowledge-asset.service";
import { Permission } from "@/lib/permissions";
import { Controller, HttpGet, HttpPost } from "@/shared/controller/decorators";
import { getDefaultCreateResponses, getDefaultFindByIDResponses } from "@/shared/controller/default-response";
import { HTTPDataSwagger } from "@/shared/http-data/http-data-swagger.decorator";
import { HTTPData } from "@/shared/http-data/http-data.decorator";
import { Param, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { FileIngestResponseDto, FileIngestDto } from "./dto/ingest.dto";
import { IngestJobStateResponseDto } from "./dto/job-state.dto";

@Controller("knowledge/:knowledgeId/asset")
export class KnowledgeAssetController extends BaseController({
  entity: KnowledgeAssetEntity,
  ignore: ["create", "update"],
  requiredPermissions: {
    delete:   [Permission.DELETE_KNOWLEDGE_ASSET],
    find:     [Permission.READ_KNOWLEDGE_ASSET],
    findByID: [Permission.READ_KNOWLEDGE_ASSET],
  }
}) {
  constructor(public service: KnowledgeAssetService) {
    super(service);
  }

  @HttpGet("ingest/:id", { responses: getDefaultFindByIDResponses(IngestJobStateResponseDto) })
  async getStatus(@Param("id") id: string) {
    return this.service.getIngestStatus(id);
  }

  @HttpPost("ingest-file", { responses: getDefaultCreateResponses(FileIngestResponseDto) })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @HTTPDataSwagger(FileIngestDto)
  async ingestFile(@UploadedFile() file: Express.Multer.File, @HTTPData(FileIngestDto) body: FileIngestDto) {
    return this.service.ingestFile(file, body);
  }
}