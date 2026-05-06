import { Type } from "class-transformer";

import { IsRecordOf } from "../validation/decorators/is-record-of";
import { Base } from "./base";
import { Field } from "./field";

export class Config extends Base {
  @IsRecordOf(Field)
  @Type(() => Field)
  fields!: Record<string, Field>;
}
