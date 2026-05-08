import { OmitType } from "@nestjs/swagger";
import { NodeTypeEntity } from "../node-type.entity";

export class CreateNodeTypeDto extends OmitType(NodeTypeEntity, ["id", "createdAt", "updatedAt"] as const) {}

