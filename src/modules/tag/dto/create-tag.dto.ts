import { OmitType } from "@nestjs/swagger";

import { TagDto } from "./tag.dto";

export class CreateTagDto extends OmitType(TagDto, ["id"] as const) {}

