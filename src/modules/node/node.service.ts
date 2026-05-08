import { Injectable } from "@nestjs/common";
import { BaseCrudService, CreateOpts, type CrudIdentity } from "@/common/crud";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { node } from "@/db/schema/node";
import { nodeTag } from "@/db/schema/entity-tags";
import { NodeEntity } from "./node.entity";
import { CreateNodeDto } from "./dto/create-node.dto";
import { UpdateNodeDto } from "./dto/update-node.dto";

@Injectable()
export class NodeService extends BaseCrudService<typeof node, NodeEntity, CreateNodeDto, UpdateNodeDto> {
  protected readonly identity: CrudIdentity<typeof node> = {
    table: node,
    idColumn: node.id,
  };

  private readonly tagsSpec: TagJoinSpec<typeof nodeTag> = {
    joinTable: nodeTag,
    ownerIdColumn: nodeTag.nodeId,
    ownerIdField: "nodeId",
  };

  constructor() {
    super("node", NodeEntity);
  }

  async addTags(nodeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, nodeId, tags);
  }

  async removeTags(nodeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, nodeId, tags);
  }

  override async create(dto: CreateNodeDto, opts?: CreateOpts): Promise<NodeEntity>;
  override async create(dto: CreateNodeDto[], opts?: CreateOpts): Promise<NodeEntity[]>;
  override async create(dto: CreateNodeDto | CreateNodeDto[], opts?: CreateOpts): Promise<NodeEntity | NodeEntity[]> {
    return this.transactions.run(async (tx) => {
      const txOpts: CreateOpts = { ...opts, tx };

      if (Array.isArray(dto)) {
        const tagsPerRow = dto.map((d) => d.tags ?? []);
        const rowsForInsert = dto.map(({ tags: _t, ...rest }) => rest as CreateNodeDto);
        const entities = await super.create(rowsForInsert, txOpts);
        await Promise.all(
          entities.map((entity, i) =>
            tagsPerRow[i]?.length ? this.addTags(entity.id, tagsPerRow[i]!, txOpts) : Promise.resolve(),
          ),
        );
        return entities;
      }

      const { tags, ...rest } = dto;
      const entity = await super.create(rest as CreateNodeDto, txOpts);
      if (tags?.length) {
        await this.addTags(entity.id, tags, txOpts);
      }
      return entity;
    });
  }
}

