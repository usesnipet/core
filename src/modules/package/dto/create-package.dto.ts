import { OmitType } from "@nestjs/swagger";

import { Package } from "../models/package.model";

export class CreatePackageDto extends OmitType(
  Package,
  ["id", "packageTags", "createdAt", "updatedAt"] as const
) {
  tags?: string[];

  constructor(data?: CreatePackageDto) {
    super();
    if (data) Object.assign(this, data);
  }
}

