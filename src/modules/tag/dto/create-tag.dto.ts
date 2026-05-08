import { OmitType } from "@nestjs/swagger";
import { TagEntity } from "../tag.entity";

export class CreateTagDto extends OmitType(TagEntity, ["id"] as const) {}

