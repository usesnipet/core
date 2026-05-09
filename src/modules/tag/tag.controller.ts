import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { TagDto } from "./dto/tag.dto";
import { TagService } from "./tag.service";

@Controller("tag")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [TagDto], description: "Tags found" })
  async findMany(@Filter() filter: FilterOptions<TagDto>): Promise<TagDto[]> {
    return this.tagService.find(filter);
  }
}

