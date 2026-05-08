import { Injectable } from "@nestjs/common";
import { BaseCrudService, CreateOpts, type CrudIdentity } from "@/common/crud";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { nodeType } from "@/db/schema/node-type";
import { nodeTypeTag } from "@/db/schema/entity-tags";
import { NodeTypeEntity } from "./node-type.entity";
import { CreateNodeTypeDto } from "./dto/create-node-type.dto";
import { UpdateNodeTypeDto } from "./dto/update-node-type.dto";

@Injectable()
export class NodeTypeService extends BaseCrudService<typeof nodeType, NodeTypeEntity, CreateNodeTypeDto, UpdateNodeTypeDto> {
  protected readonly identity: CrudIdentity<typeof nodeType> = {
    table: nodeType,
    idColumn: nodeType.id,
  };

  private readonly tagsSpec: TagJoinSpec<typeof nodeTypeTag> = {
    joinTable: nodeTypeTag,
    ownerIdColumn: nodeTypeTag.nodeTypeId,
    ownerIdField: "nodeTypeId",
  };

  constructor() {
    super("nodeType", NodeTypeEntity);
  }

  async addTags(nodeTypeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, nodeTypeId, tags);
  }

  async removeTags(nodeTypeId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, nodeTypeId, tags);
  }
}

