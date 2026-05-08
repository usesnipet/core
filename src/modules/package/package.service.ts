import { Injectable } from "@nestjs/common";
import { BaseCrudService, type CrudIdentity } from "@/common/crud";
import { packageTable } from "@/db/schema/package";
import { PackageEntity } from "./package.entity";
import { CreatePackageDto } from "./dto/create-package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";

@Injectable()
export class PackageService extends BaseCrudService<typeof packageTable, PackageEntity, CreatePackageDto, UpdatePackageDto> {
  protected readonly identity: CrudIdentity<typeof packageTable> = {
    table: packageTable,
    idColumn: packageTable.id,
  };

  constructor() {
    super("package", PackageEntity);
  }
}

