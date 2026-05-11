import { OmitType, PartialType } from "@nestjs/swagger";

import { Config } from "../models/config.model";

export class UpdateConfigDto extends PartialType(
  OmitType(Config, ["id", "configTags", "createdAt", "updatedAt"] as const),
) {
  id: string;
  tags?: string[];

  constructor(data: UpdateConfigDto) {
    super();
    Object.assign(this, data);
  }
}
