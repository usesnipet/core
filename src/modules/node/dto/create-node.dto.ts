import { OmitType } from "@nestjs/swagger";
import { NodeEntity } from "../node.entity";

export class CreateNodeDto extends OmitType(NodeEntity, ["id", "createdAt", "updatedAt"] as const) {}

