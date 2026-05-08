import { OmitType } from "@nestjs/swagger";
import { PackageEntity } from "../package.entity";

export class CreatePackageDto extends OmitType(PackageEntity, ["id", "createdAt", "updatedAt"] as const) {}

