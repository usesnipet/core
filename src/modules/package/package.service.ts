import { Injectable } from "@nestjs/common";
import { BaseCrudService, CreateOpts, type CrudIdentity } from "@/common/crud";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { packageTable } from "@/db/schema/package";
import { PackageEntity } from "./package.entity";
import { CreatePackageDto } from "./dto/create-package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";
import { packageTag } from "@/db/schema/entity-tags";

@Injectable()
export class PackageService extends BaseCrudService<typeof packageTable, PackageEntity, CreatePackageDto, UpdatePackageDto> {
  protected readonly identity: CrudIdentity<typeof packageTable> = {
    table: packageTable,
    idColumn: packageTable.id,
  };

  private readonly tagsSpec: TagJoinSpec<typeof packageTag> = {
    joinTable: packageTag,
    ownerIdColumn: packageTag.packageId,
    ownerIdField: "packageId",
  };

  constructor() {
    super("package", PackageEntity);
  }

  async addTags(packageId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, packageId, tags);
  }

  async removeTags(packageId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, packageId, tags);
  }
}

