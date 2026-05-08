import { Injectable } from "@nestjs/common";
import { BaseCrudService, type CrudIdentity } from "@/common/crud";
import { nodeType } from "@/db/schema/node-type";
import { NodeTypeEntity } from "./node-type.entity";
import { CreateNodeTypeDto } from "./dto/create-node-type.dto";
import { UpdateNodeTypeDto } from "./dto/update-node-type.dto";

@Injectable()
export class NodeTypeService extends BaseCrudService<typeof nodeType, NodeTypeEntity, CreateNodeTypeDto, UpdateNodeTypeDto> {
  protected readonly identity: CrudIdentity<typeof nodeType> = {
    table: nodeType,
    idColumn: nodeType.id,
  };

  constructor() {
    super("nodeType", NodeTypeEntity);
  }
}

