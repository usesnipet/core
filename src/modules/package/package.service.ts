import { BaseService, CreateOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { packageTag } from "@/db/schema/entity-tags";
import { PackageRow, packageTable } from "@/db/schema/package";
import { tag } from "@/db/schema/tag";
import { packages } from "@/packages";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { CreatePackageDto } from "./dto/create-package.dto";
import { PackageDto } from "./dto/package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";

@Injectable()
export class PackageService extends BaseService implements OnModuleInit {
  private readonly logger = new Logger(PackageService.name);
  constructor() {
    super();
  }

  onModuleInit() {
    return this.syncPackages();
  }

  async syncPackages() {
    const pkgIds = packages.map(({ schema }) => schema.id);
    const pkgEntities = await this.db().query.package.findMany({
      where(fields) {
        return inArray(fields.packageId, pkgIds);
      },
      with: { packageTags: { with: { tag: true } } }
    })

    const { toCreate, toUpdate } = packages.reduce((acc, cur) => {
      const { schema } = cur;
      const pkgEntity = pkgEntities.find((p) => p.packageId === schema.id);
      if (pkgEntity) {
        if (
          schema.metadata.name !== pkgEntity.name ||
          schema.version !== pkgEntity.version ||
          schema.metadata.description !== pkgEntity.description ||
          schema.metadata.author !== (pkgEntity.author ?? undefined) ||
          schema.metadata.docs !== (pkgEntity.docs ?? undefined) ||
          schema.metadata.icon !== (pkgEntity.icon ?? undefined) ||
          schema.metadata.tags?.length !== pkgEntity.packageTags.length ||
          schema.metadata.tags?.some((t) => !pkgEntity.packageTags.some((t2) => t2.tag.name === t))
        ) {
          acc.toUpdate.push(new UpdatePackageDto({
            id: pkgEntity.id,
            packageId: schema.id,
            name: schema.metadata.name,
            version: schema.version,
            description: schema.metadata.description,
            author: schema.metadata.author ?? null,
            docs: schema.metadata.docs ?? null,
            icon: schema.metadata.icon ?? null,
            tags: schema.metadata.tags,
          }));
        }
      } else {
        acc.toCreate.push(new CreatePackageDto({
          packageId: schema.id,
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
    }, { toCreate: [] as CreatePackageDto[], toUpdate: [] as UpdatePackageDto[] });

    if (toCreate.length > 0) {
      this.logger.log(`Creating ${toCreate.length} packages`);
      await this.create(toCreate);
    }
    if (toUpdate.length > 0) {
      this.logger.log(`Updating ${toUpdate.length} packages`);
      await this.update(toUpdate);
    }
  }

  async find(filter: FilterOptions<PackageRow>, opts?: ReadOpts): Promise<PackageDto[]> {
    return this.db(opts).query.package.findMany(DrizzleFilterConverter.toFindMany(filter));
  }

  async create(dto: CreatePackageDto, opts?: CreateOpts): Promise<PackageDto>;
  async create(dto: CreatePackageDto[], opts?: CreateOpts): Promise<PackageDto[]>;
  async create(dto: CreatePackageDto | CreatePackageDto[], opts?: CreateOpts): Promise<PackageDto | PackageDto[]> {
    return this.transactions.run(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };

      if (Array.isArray(dto)) {
        if (dto.length === 0) return [];
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => rest as CreatePackageDto);
        const entities = await this.db(txOpts).insert(packageTable).values(rowsForInsert).returning();
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities;
      }

      const { tags, ...rest } = dto;
      const [entity] = await this.db(txOpts).insert(packageTable).values(rest as CreatePackageDto).returning();
      if (tags?.length) await this.addTags(entity.id, tags, txOpts);
      return entity;
    });
  }

  async update(dtos: UpdatePackageDto[], opts?: UpdateOpts): Promise<PackageDto[]> {
    return this.transactions.run(async (tx) => {
      const txOpts: UpdateOpts = { ...opts, tx };

      const updated = await Promise.all(
        dtos.map(async (dto) => {
          const { id, ...rest } = dto;
          const patch = Object.fromEntries(
            Object.entries(rest).filter(([key, v]) => key !== "tags" && v !== undefined),
          ) as Omit<UpdatePackageDto, "id" | "tags">;

          const [row] = await this.db(txOpts)
            .update(packageTable)
            .set({ ...(patch as any), updatedAt: new Date() })
            .where(eq(packageTable.id, id))
            .returning();

          if (Object.hasOwn(dto, "tags")) {
            await this.db(txOpts).delete(packageTag).where(eq(packageTag.packageId, id));
            const nextTags = dto.tags ?? [];
            if (nextTags.length > 0) {
              await this.addTags(id, nextTags, txOpts as CreateOpts);
            }
          }

          return row as unknown as PackageDto;
        }),
      );

      return updated;
    });
  }

  //#region Tag related
  private readonly tagsSpec: TagJoinSpec<typeof packageTag> = {
    joinTable: packageTag,
    ownerIdColumn: packageTag.packageId,
    ownerIdField: "packageId",
  };

  async addTags(packageId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, packageId, tags);
  }

  async removeTags(packageId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, packageId, tags);
  }
  //#endregion
}

