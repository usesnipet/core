import { Exclude, Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";

import { Config } from "./config";
import { Node } from "./node";
import { NodeType } from "./node-type";
import { Base } from "./base";

export class Package extends Base {
  @Exclude()
  declare id: never;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeType)
  nodeTypes!: NodeType[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Config)
  configs!: Config[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Node)
  nodes!: Node[];
}