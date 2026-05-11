import { BaseService, CreateOpts, DeleteOpts, ReadOpts, UpdateOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { PackageSchema } from "@/core/schemas/package";
import { ConfigRow } from "@/db/schema/config";
import { nodeTag } from "@/db/schema/entity-tags";
import { node, NodeRow } from "@/db/schema/node";
import { NodeTypeRow } from "@/db/schema/node-type";
import { PackageRow } from "@/db/schema/package";
import { Injectable, Logger } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { CreateNodeDto } from "./dto/create-node.dto";
import { UpdateNodeDto } from "./dto/update-node.dto";
import { Node } from "./models/node.model";

function packageRowForSchemaId(dbPackages: PackageRow[], schemaId: string): PackageRow | undefined {
  return dbPackages.find((p) => schemaId === p.packageId || schemaId.startsWith(`${p.packageId}:`));
}

@Injectable()
export class NodeService extends BaseService {
  private readonly logger = new Logger(NodeService.name);

  constructor() {
    super();
  }

  async find(filter: FilterOptions<Node>, opts?: ReadOpts): Promise<Node[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.node.findMany(drizzleFilter);
    return queryResult.map((row) => new Node(row));
  }

  async create(dto: CreateNodeDto, opts?: CreateOpts): Promise<Node>;
  async create(dto: CreateNodeDto[], opts?: CreateOpts): Promise<Node[]>;
  async create(dto: CreateNodeDto | CreateNodeDto[], opts?: CreateOpts): Promise<Node | Node[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };
      if (Array.isArray(dto)) {
        if (dto.length === 0) return [];
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => rest);
        const entities = await this.db(txOpts).insert(node).values(rowsForInsert).returning();
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities.map((e) => new Node(e));
      }
      const { tags, ...rest } = dto;
      const [entity] = await this.db(txOpts).insert(node).values(rest).returning();
      if (tags?.length) await this.addTags(entity.id, tags, txOpts);
      return new Node(entity);
    }, opts);
  }

  async update(dtos: UpdateNodeDto[], opts?: UpdateOpts): Promise<Node[]> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: UpdateOpts = { ...opts, tx };

      const updated = await Promise.all(
        dtos.map(async (dto) => {
          const { id, ...rest } = dto;
          const patch = Object.fromEntries(
            Object.entries(rest).filter(([key, v]) => key !== "tags" && v !== undefined),
          ) as Omit<UpdateNodeDto, "id" | "tags">;

          const [row] = await this.db(txOpts)
            .update(node)
            .set({ ...(patch as any), updatedAt: new Date() })
            .where(eq(node.id, id))
            .returning();

          if (Object.hasOwn(dto, "tags")) {
            await this.db(txOpts).delete(nodeTag).where(eq(nodeTag.nodeId, id));
            const nextTags = dto.tags ?? [];
            if (nextTags.length > 0) {
              await this.addTags(id, nextTags, txOpts as CreateOpts);
            }
          }
          return new Node(row);
        }),
      );

      return updated;
    }, opts);
  }

  async delete(ids: string[], opts?: DeleteOpts): Promise<void> {
    return this.transactions.runOrCreate(async (tx) => {
      const txOpts: DeleteOpts = { ...opts, tx };
      await this.db(txOpts).delete(node).where(inArray(node.id, ids));
    }, opts);
  }

  /**
   * Upserts nodes from in-process package manifests into the database.
   * Removes DB rows for nodes whose `node_id` no longer appears in any manifest.
   */
  async syncNodes(
    dbPackages: PackageRow[],
    dbNodeTypes: NodeTypeRow[],
    dbConfigs: ConfigRow[],
    packageSchemas: PackageSchema[],
  ): Promise<NodeRow[]> {
    const nodeSchemas = packageSchemas.map((p) => p.nodes.map((n) => ({ ...n, packageId: p.id }))).flat();
    const ids = new Set(nodeSchemas.map((n) => n.id));

    const entities = await this.db().query.node.findMany({
      where(fields, { inArray }) {
        return inArray(fields.nodeId, Array.from(ids));
      },
      with: { nodeTags: { with: { tag: true } } },
    });

    const packageDbIdByPackageId = new Map(dbPackages.map((p) => [p.packageId, p.id]));
    const nodeTypeIdByTypeId = new Map(dbNodeTypes.map((nt) => [nt.typeId, nt.id]));
    const configDbIdByConfigId = new Map(dbConfigs.map((c) => [c.configId, c.id]));

    const { toCreate, toUpdate } = nodeSchemas.reduce(
      (acc, schema) => {
        const row = entities.find((e) => e.nodeId === schema.id);

        const packageId = packageDbIdByPackageId.get(schema.packageId);
        if (!packageId) throw new Error(`Package not found for node ${schema.id}`);

        const resolvedNodeTypeId = nodeTypeIdByTypeId.get(schema.type);
        if (!resolvedNodeTypeId) throw new Error(`Node type not found for node ${schema.id} (type=${schema.type})`);

        const resolvedConfigId = schema.config ? (configDbIdByConfigId.get(schema.config) ?? null) : null;

        const next = new CreateNodeDto({
          nodeId: schema.id,
          packageId: packageId,
          name: schema.metadata?.name ?? schema.id,
          description: schema.metadata?.description ?? null,
          docs: schema.metadata?.docs ?? null,
          icon: schema.metadata?.icon ?? null,
          author: schema.metadata?.author ?? null,
          nodeTypeId: resolvedNodeTypeId,
          configId: resolvedConfigId,
          tags: schema.metadata?.tags ?? [],
        });

        if (row) {
          if (
            next.name !== row.name ||
            (next.description ?? null) !== (row.description ?? null) ||
            (next.docs ?? null) !== (row.docs ?? null) ||
            (next.icon ?? null) !== (row.icon ?? null) ||
            (next.author ?? null) !== (row.author ?? null) ||
            next.nodeId !== row.nodeId ||
            next.packageId !== row.packageId ||
            next.nodeTypeId !== row.nodeTypeId ||
            (next.configId ?? null) !== (row.configId ?? null) ||
            next.tags?.length !== row.nodeTags.length ||
            next.tags?.some((t) => !row.nodeTags.some((t2) => t2.tag.name === t))
          ) {
            acc.toUpdate.push(
              new UpdateNodeDto({
                id: row.id,
                ...next,
              }),
            );
          }
        } else {
          acc.toCreate.push(next);
        }

        return acc;
      },
      { toCreate: [] as CreateNodeDto[], toUpdate: [] as UpdateNodeDto[] },
    );

    const toDelete = entities.filter((e) => !ids.has(e.nodeId));

    if (toCreate.length > 0) {
      this.logger.log(`Creating ${toCreate.length} nodes`);
      await this.create(toCreate);
    }
    if (toUpdate.length > 0) {
      this.logger.log(`Updating ${toUpdate.length} nodes`);
      await this.update(toUpdate);
    }
    if (toDelete.length > 0) {
      this.logger.log(`Deleting ${toDelete.length} nodes`);
      await this.delete(toDelete.map((e) => e.id));
    }
    return await this.db().query.node.findMany({ with: { nodeTags: { with: { tag: true } } } });
  }

  //#region Tag related
  private readonly tagsSpec: TagJoinSpec<typeof nodeTag> = {
    joinTable: nodeTag,
    ownerIdColumn: nodeTag.nodeId,
    ownerIdField: "nodeId",
  };

  async addTags(nodeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, nodeId, tags);
  }

  async removeTags(nodeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, nodeId, tags);
  }
  //#endregion
}
