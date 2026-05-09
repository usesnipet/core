import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { PackageDto } from "./dto/package.dto";
import { PackageService } from "./package.service";

@Controller("package")
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [PackageDto], description: "Packages found" })
  async findMany(@Filter() filter: FilterOptions<PackageDto>): Promise<PackageDto[]> {
    return this.packageService.find(filter);
  }
}

