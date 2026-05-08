import { OmitType, PartialType } from "@nestjs/swagger";
import { ConfigEntity } from "../config.entity";

export class UpdateConfigDto extends PartialType(OmitType(ConfigEntity, ["id", "createdAt", "updatedAt"] as const)) {}

