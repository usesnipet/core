import { OmitType } from "@nestjs/swagger";

import { Config } from "../models/config.model";

export class CreateConfigDto extends OmitType(Config, ["id", "configTags", "createdAt", "updatedAt"] as const) {
  tags?: string[];

  constructor(data?: CreateConfigDto) {
    super();
    if (data) Object.assign(this, data);
  }
}
