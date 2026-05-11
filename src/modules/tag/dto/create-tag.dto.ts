import { OmitType } from "@nestjs/swagger";

import { Tag } from "../models/tag.model";

export class CreateTagDto extends OmitType(Tag, ["id"] as const) {}
