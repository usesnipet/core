import { OmitType, PartialType } from "@nestjs/swagger";
import { PackageEntity } from "../package.entity";

export class UpdatePackageDto extends PartialType(OmitType(PackageEntity, ["id", "createdAt", "updatedAt"] as const))  {}

