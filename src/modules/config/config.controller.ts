import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { ConfigService } from "./config.service";
import { Config } from "./models/config.model";

@Controller("config")
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [Config], description: "Config definitions found" })
  async findMany(@Filter() filter: FilterOptions<Config>): Promise<Config[]> {
    return this.configService.find(filter);
  }
}
