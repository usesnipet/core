import { OmitType, PartialType } from "@nestjs/swagger";

import { Package } from "../models/package.model";

export class UpdatePackageDto extends PartialType(
  OmitType(Package, ["id", "packageTags", "createdAt", "updatedAt"] as const)
) {
  id: string;
  tags?: string[];

  constructor(data: UpdatePackageDto) {
    super();
    Object.assign(this, data);
  }
}

