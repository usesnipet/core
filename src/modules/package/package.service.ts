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

  override async create(dto: CreatePackageDto, opts?: CreateOpts): Promise<PackageEntity>;
  override async create(dto: CreatePackageDto[], opts?: CreateOpts): Promise<PackageEntity[]>;
  override async create(dto: CreatePackageDto | CreatePackageDto[], opts?: CreateOpts): Promise<PackageEntity | PackageEntity[]> {
    return this.transactions.run(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };

      if (Array.isArray(dto)) {
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => rest as CreatePackageDto);
        const entities = await super.create(rowsForInsert, txOpts);
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities;
      }

      const { tags, ...rest } = dto;
      const entity = await super.create(rest as CreatePackageDto, txOpts);
      console.log(tags);
      if (tags?.length) {

        await this.addTags(entity.id, tags, txOpts);
      }
      return entity;
    });
  }
}

