import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { ConfigSchema } from "@/core/schemas/config";
import { config, ConfigRow } from "@/db/schema/config";
import { configTag } from "@/db/schema/entity-tags";
import { PackageRow } from "@/db/schema/package";
import { Injectable, Logger } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { CreateConfigDto } from "./dto/create-config.dto";
import { UpdateConfigDto } from "./dto/update-config.dto";
import { Config } from "./models/config.model";

function insertRowFromDto(rest: Omit<CreateConfigDto, "tags">) {
  return {
    ...rest,
    fieldSchema: rest.fieldSchema ?? [],
  };
}

function packageRowForSchemaId(dbPackages: PackageRow[], schemaId: string): PackageRow | undefined {
  return dbPackages.find((p) => schemaId === p.packageId || schemaId.startsWith(`${p.packageId}:`));
}

@Injectable()
export class ConfigService extends BaseService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    super();
  }

  async find(filter: FilterOptions<Config>, opts?: ReadOpts): Promise<Config[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.config.findMany(drizzleFilter);
    return queryResult.map((row) => new Config(row));
  }

  async create(dto: CreateConfigDto, opts?: CreateOpts): Promise<Config>;
  async create(dto: CreateConfigDto[], opts?: CreateOpts): Promise<Config[]>;
  async create(dto: CreateConfigDto | CreateConfigDto[], opts?: CreateOpts): Promise<Config | Config[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };

      if (Array.isArray(dto)) {
        if (dto.length === 0) return [];
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => insertRowFromDto(rest));
        const entities = await this.db(txOpts).insert(config).values(rowsForInsert).returning();
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities.map((entity) => new Config(entity));
      }

      const { tags, ...rest } = dto;
      const [entity] = await this.db(txOpts).insert(config).values(insertRowFromDto(rest)).returning();
      if (tags?.length) await this.addTags(entity.id, tags, txOpts);
      return new Config(entity);
    }, opts);
  }

  async update(dtos: UpdateConfigDto[], opts?: UpdateOpts): Promise<Config[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: UpdateOpts = { ...opts, tx };

      const updated = await Promise.all(
        dtos.map(async (dto) => {
          const { id, ...rest } = dto;
          const patch = Object.fromEntries(
            Object.entries(rest).filter(([key, v]) => key !== "tags" && v !== undefined),
          ) as Omit<UpdateConfigDto, "id" | "tags">;

          const [row] = await this.db(txOpts)
            .update(config)
            .set({ ...(patch as any), updatedAt: new Date() })
            .where(eq(config.id, id))
            .returning();

          if (Object.hasOwn(dto, "tags")) {
            await this.db(txOpts).delete(configTag).where(eq(configTag.configId, id));
            const nextTags = dto.tags ?? [];
            if (nextTags.length > 0) {
              await this.addTags(id, nextTags, txOpts as CreateOpts);
            }
          }

          return new Config(row);
        }),
      );

      return updated;
    }, opts);
  }

  async delete(ids: string[], opts?: DeleteOpts): Promise<void> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: DeleteOpts = { ...opts, tx };
      await this.db(txOpts).delete(config).where(inArray(config.id, ids));
    }, opts);
  }

  //#region Tag related
  private readonly tagsSpec: TagJoinSpec<typeof configTag> = {
    joinTable: configTag,
    ownerIdColumn: configTag.configId,
    ownerIdField: "configId",
  };

  async addTags(configId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, configId, tags);
  }

  async removeTags(configId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, configId, tags);
  }
  //#endregion

  /**
   * Upserts config definitions from in-process package manifests into the database.
   */
  async syncConfigs(dbPackages: PackageRow[], configSchemas: ConfigSchema[]): Promise<ConfigRow[]> {
    const ids = new Set(configSchemas.map((c) => c.id));
    const entities = await this.db().query.config.findMany({
      where(fields, { inArray }) {
        return inArray(fields.configId, Array.from(ids));
      },
      with: { configTags: { with: { tag: true } } },
    });

    const { toCreate, toUpdate } = configSchemas.reduce(
      (acc, schema) => {
        const row = entities.find((e) => e.configId === schema.id);
        if (row) {
          const fieldsChanged =
            JSON.stringify(schema.fields) !== JSON.stringify(row.fieldSchema);
          if (
            (schema.metadata?.name ?? row.name) !== row.name ||
            (schema.metadata?.description ?? null) !== row.description ||
            (schema.metadata?.docs ?? null) !== row.docs ||
            (schema.metadata?.icon ?? null) !== row.icon ||
            (schema.metadata?.author ?? null) !== row.author ||
            fieldsChanged ||
            schema.metadata?.tags?.length !== row.configTags.length ||
            schema.metadata?.tags?.some((t) => !row.configTags.some((t2) => t2.tag.name === t))
          ) {
            acc.toUpdate.push(
              new UpdateConfigDto({
                id: row.id,
                configId: schema.id,
                packageId: row.packageId,
                name: schema.metadata?.name ?? row.name,
                description: schema.metadata?.description ?? row.description ?? null,
                docs: schema.metadata?.docs ?? row.docs ?? null,
                icon: schema.metadata?.icon ?? row.icon ?? null,
                author: schema.metadata?.author ?? row.author ?? null,
                fieldSchema: schema.fields,
                tags: schema.metadata?.tags,
              }),
            );
          }
        } else {
          const packageEntity = packageRowForSchemaId(dbPackages, schema.id);
          if (!packageEntity) throw new Error(`Package not found for config ${schema.id}`);

          acc.toCreate.push(
            new CreateConfigDto({
              configId: schema.id,
              packageId: packageEntity.id,
              name: schema.metadata?.name ?? schema.id,
              description: schema.metadata?.description ?? null,
              docs: schema.metadata?.docs ?? null,
              icon: schema.metadata?.icon ?? null,
              author: schema.metadata?.author ?? null,
              fieldSchema: schema.fields ?? [],
              tags: schema.metadata?.tags,
            }),
          );
        }
        return acc;
      },
      { toCreate: [] as CreateConfigDto[], toUpdate: [] as UpdateConfigDto[] },
    );
    const toDelete = entities.filter((e) => !ids.has(e.configId));

    if (toCreate.length > 0) {
      this.logger.log(`Creating ${toCreate.length} configs`);
      await this.create(toCreate);
    }
    if (toUpdate.length > 0) {
      this.logger.log(`Updating ${toUpdate.length} configs`);
      await this.update(toUpdate);
    }
    if (toDelete.length > 0) {
      this.logger.log(`Deleting ${toDelete.length} configs`);
      await this.delete(toDelete.map((entity) => entity.id));
    }
    return await this.db().query.config.findMany({ with: { configTags: { with: { tag: true } } } });
  }
}
