import { Injectable } from "@nestjs/common";
import { BaseCrudService, type CrudIdentity } from "@/common/crud";
import { node } from "@/db/schema/node";
import { NodeEntity } from "./node.entity";
import { CreateNodeDto } from "./dto/create-node.dto";
import { UpdateNodeDto } from "./dto/update-node.dto";

@Injectable()
export class NodeService extends BaseCrudService<typeof node, NodeEntity, CreateNodeDto, UpdateNodeDto> {
  protected readonly identity: CrudIdentity<typeof node> = {
    table: node,
    idColumn: node.id,
  };

  constructor() {
    super("node", NodeEntity);
  }
}

