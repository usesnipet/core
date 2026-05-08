import { BaseCrudService, CreateOpts, CrudIdentity } from "@/common/crud";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { PackageSchema } from "@/core/schemas/package";
import { packageTag } from "@/db/schema/entity-tags";
import { packageTable } from "@/db/schema/package";
import { packages } from "@/packages";
import { Injectable, OnModuleInit } from "@nestjs/common";

import { CreatePackageDto } from "./dto/create-package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";
import { PackageEntity } from "./package.entity";

@Injectable()
export class PackageService
 extends BaseCrudService<typeof packageTable, PackageEntity, CreatePackageDto, UpdatePackageDto>
 implements OnModuleInit {
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

  onModuleInit() {
    return this.syncPackages();
  }

  async syncPackages() {
    const pkgIds = packages.map(({ schema }) => schema.id);
    const pkgEntities = await this.findMany({
      where: { id: { op: "in", value: pkgIds }},
    });

    const { toCreate, toUpdate } = packages.reduce((acc, cur) => {
      const { schema } = cur;
      if (pkgEntities.some((pkg) => pkg.id === schema.id)) {
        acc.toUpdate.push(schema);
      } else {
        acc.toCreate.push(new CreatePackageDto({
          name: schema.metadata.name,
          version: schema.version,
          description: schema.metadata.description,
          author: schema.metadata.author ?? null,
          docs: schema.metadata.docs ?? null,
          icon: schema.metadata.icon ?? null,
          tags: schema.metadata.tags,
        }));
      }
      return acc;
    }, { toCreate: [] as CreatePackageDto[], toUpdate: [] as PackageSchema[] });

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
      if (tags?.length) await this.addTags(entity.id, tags, txOpts);
      return entity;
    });
  }
}

