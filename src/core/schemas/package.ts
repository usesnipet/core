import { Type } from "class-transformer";
import { IsArray, IsSemVer, IsString, ValidateNested } from "class-validator";

import { BaseSchema } from "./base";
import { ConfigSchema } from "./config";
import { NodeSchema } from "./node";
import { NodeTypeSchema } from "./node-type";

export class PackageSchema extends BaseSchema {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeTypeSchema)
  nodeTypes!: NodeTypeSchema[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigSchema)
  configs!: ConfigSchema[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeSchema)
  nodes!: NodeSchema[];

  @IsString()
  @IsSemVer({ message: "Version must be a valid semver" })
  version!: string;
}