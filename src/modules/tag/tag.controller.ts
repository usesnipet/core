import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { TagEntity } from "./tag.entity";
import { TagService } from "./tag.service";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";

@Controller("tag")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [TagEntity], description: "Tags found" })
  async findMany(@Filter() filter: FilterOptions<TagEntity>): Promise<TagEntity[]> {
    return this.tagService.findMany(filter);
  }

  @Get(":id")
  @ApiParam({ name: "id", format: "uuid", description: "Tag id" })
  @ApiOkResponse({ type: TagEntity, description: "Tag found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<TagEntity | undefined> {
    return this.tagService.findById(id);
  }

  @Post()
  @ApiBody({ type: CreateTagDto, description: "Create tag" })
  @ApiOkResponse({ type: TagEntity, description: "Tag created" })
  create(@Body() dto: CreateTagDto): Promise<TagEntity> {
    return this.tagService.create(dto);
  }

  @Put(":id")
  @ApiBody({ type: UpdateTagDto, description: "Update tag" })
  @ApiOkResponse({ type: TagEntity, description: "Tag updated" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTagDto): Promise<TagEntity | undefined> {
    return this.tagService.updateById(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Tag deleted" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.tagService.deleteById(id);
    return { deleted };
  }
}

