import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { ConfigService } from "./config.service";
import { ConfigDto } from "./dto/config.dto";

@Controller("config")
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [ConfigDto], description: "Config definitions found" })
  async findMany(@Filter() filter: FilterOptions<ConfigDto>): Promise<ConfigDto[]> {
    return this.configService.find(filter);
  }
}
