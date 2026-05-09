import { BaseService } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { tag, TagRow } from "@/db/schema/tag";
import { Injectable } from "@nestjs/common";

import { TagDto } from "./dto/tag.dto";

@Injectable()
export class TagService extends BaseService {
  constructor() {
    super();
  }

  async find(filter: FilterOptions<TagRow>): Promise<TagDto[]> {
    return this.db().query.tag.findMany(DrizzleFilterConverter.toFindMany(filter));
  }
}

