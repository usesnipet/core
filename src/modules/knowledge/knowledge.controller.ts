import { KnowledgeEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { ApiFilterQuery, Controller, Filter, HttpGet, HttpPost } from "@/shared/controller/decorators";

import { KnowledgeService } from "./knowledge.service";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";
import { Permission } from "@/lib/permissions";
import { UpdateKnowledgeDto } from "./dto/update-knowledge.dto";
import {
  getDefaultFindByIDResponses,
  getDefaultCreateResponses,
  getDefaultFindResponses
} from "@/shared/controller/default-response";
import { Param, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { FileIngestDto, FileIngestResponseDto } from "./dto/ingest.dto";
import { IngestJobStateResponseDto } from "./dto/job-state.dto";
import { HTTPData } from "@/shared/http-data/http-data.decorator";
import { HTTPDataSwagger } from "@/shared/http-data/http-data-swagger.decorator";
import { FilterOptions } from "@/shared/filter-options";
import { GetAssetsDto } from "./dto/get-assets.dto";
import { KnowledgeAssetEntity } from "./asset/knowledge-asset.entity";

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

  @HttpGet("ingest-status/:id", { responses: getDefaultFindByIDResponses(IngestJobStateResponseDto) })
  async getStatus(@Param("id") id: string) {
    return this.service.getIngestStatus(id);
  }

  @HttpPost(":knowledgeId/ingest-file", { responses: getDefaultCreateResponses(FileIngestResponseDto) })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @HTTPDataSwagger(FileIngestDto)
  async ingestFile(@UploadedFile() file: Express.Multer.File, @HTTPData(FileIngestDto) body: FileIngestDto) {
    return this.service.ingestFile(file, body);
  }

  @ApiFilterQuery(
    ["id", "createdById", "type"] as Array<keyof KnowledgeAssetEntity>,
    ["knowledge", "createdBy"] as Array<keyof KnowledgeAssetEntity>
  )
  @HttpGet(":knowledgeId/assets", { responses: getDefaultFindResponses(KnowledgeAssetEntity) })
  @HTTPDataSwagger(GetAssetsDto)
  async getAssets(
    @HTTPData(GetAssetsDto) data: GetAssetsDto,
    @Filter() filterOpts: FilterOptions<KnowledgeAssetEntity>
  ) {
    return this.service.getAssets(data, filterOpts);
  }
}