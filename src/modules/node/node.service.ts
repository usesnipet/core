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
}

