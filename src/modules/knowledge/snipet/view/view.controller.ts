import { Controller, Filter, HttpGet } from "@/shared/controller/decorators";
import { HTTPDataSwagger } from "@/shared/http-data/http-data-swagger.decorator";
import { ViewDto } from "./dto/base.dto";
import { HTTPData } from "@/shared/http-data/http-data.decorator";
import { FilterOptions } from "@/shared/filter-options";
import { getDefaultFindResponses } from "@/shared/controller/default-response";
import { ViewService } from "./view.service";
import { ViewChatDto } from "./dto/view-chat.dto";
import { SnipetAssetDto } from "../dto/snipet-asset.dto";
import { Inject } from "@nestjs/common";

@Controller("knowledge/:knowledgeId/snipet/:snipetId/view")
export class ViewController {
  @Inject() private readonly service: ViewService;

  @HttpGet("", { responses: getDefaultFindResponses(ViewChatDto, false) })
  @HTTPDataSwagger(ViewDto)
  async view(@HTTPData(ViewDto) data: ViewDto, @Filter() filterOpts: FilterOptions<SnipetAssetDto>) {
    return this.service.view(filterOpts, data);
  }
}