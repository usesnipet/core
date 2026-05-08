import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { ApiFilterQueries, Filter, FilterOptions } from "@/common/filter";
import { PackageEntity } from "./package.entity";
import { PackageService } from "./package.service";
import { CreatePackageDto } from "./dto/create-package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";

@Controller("package")
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Get()
  @ApiFilterQueries()
  @ApiOkResponse({ type: [PackageEntity], description: "Packages found" })
  async findMany(@Filter() filter: FilterOptions<PackageEntity>): Promise<PackageEntity[]> {
    return this.packageService.findMany(filter);
  }

  @Get(":id")
  @ApiParam({ name: "id", format: "uuid", description: "Package id" })
  @ApiOkResponse({ type: PackageEntity, description: "Package found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PackageEntity | undefined> {
    return this.packageService.findById(id);
  }

  @Post()
  @ApiBody({ type: CreatePackageDto, description: "Create package" })
  @ApiOkResponse({ type: PackageEntity, description: "Package created" })
  create(@Body() dto: CreatePackageDto): Promise<PackageEntity> {
    return this.packageService.create(dto);
  }

  @Put(":id")
  @ApiBody({ type: UpdatePackageDto, description: "Update package" })
  @ApiOkResponse({ type: PackageEntity, description: "Package updated" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePackageDto): Promise<PackageEntity | undefined> {
    return this.packageService.updateById(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Package deleted" })
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.packageService.deleteById(id);
    return { deleted };
  }
}

