import { OmitType } from "@nestjs/swagger";
import { ConfigEntity } from "../config.entity";

export class CreateConfigDto extends OmitType(ConfigEntity, ["id", "createdAt", "updatedAt"] as const) {}

