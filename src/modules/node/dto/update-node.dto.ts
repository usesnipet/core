import { OmitType, PartialType } from "@nestjs/swagger";
import { NodeEntity } from "../node.entity";

export class UpdateNodeDto extends PartialType(OmitType(NodeEntity, ["id", "createdAt", "updatedAt"] as const)) {}

