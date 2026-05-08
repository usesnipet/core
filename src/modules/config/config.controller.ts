import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { ConfigEntity } from "./config.entity";
import { ConfigService } from "./config.service";
import { CreateConfigDto } from "./dto/create-config.dto";
import { UpdateConfigDto } from "./dto/update-config.dto";

@Controller("config")
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [ConfigEntity], description: "Configs found" })
  async findMany(@Filter() filter: FilterOptions<ConfigEntity>): Promise<ConfigEntity[]> {
    return this.configService.findMany(filter);
  }

  @Get(":id")
  @ApiParam({ name: "id", format: "uuid", description: "Config id" })
  @ApiOkResponse({ type: ConfigEntity, description: "Config found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<ConfigEntity | undefined> {
    return this.configService.findById(id);
  }

  @Post()
  @ApiBody({ type: CreateConfigDto, description: "Create config" })
  @ApiOkResponse({ type: ConfigEntity, description: "Config created" })
  create(@Body() dto: CreateConfigDto): Promise<ConfigEntity> {
    return this.configService.create(dto);
  }

  @Put(":id")
  @ApiBody({ type: UpdateConfigDto, description: "Update config" })
  @ApiOkResponse({ type: ConfigEntity, description: "Config updated" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateConfigDto): Promise<ConfigEntity | undefined> {
    return this.configService.updateById(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Config deleted" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.configService.deleteById(id);
    return { deleted };
  }
}

