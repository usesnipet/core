import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { Tag } from "./models/tag.model";
import { TagService } from "./tag.service";

@Controller("tag")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Tag], description: "Tags found" })
  async findMany(@Filter() filter: FilterOptions<Tag>): Promise<Tag[]> {
    return this.tagService.find(filter);
  }
}
