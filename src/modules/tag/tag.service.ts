import { BaseService, ReadOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { Injectable } from "@nestjs/common";

import { Tag } from "./models/tag.model";

@Injectable()
export class TagService extends BaseService {
  constructor() {
    super();
  }

  async find(filter: FilterOptions<Tag>, opts?: ReadOpts): Promise<Tag[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.tag.findMany(drizzleFilter);
    return queryResult.map((row) => new Tag(row));
  }
}
