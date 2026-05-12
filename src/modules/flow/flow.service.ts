import { BaseService, ReadOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { Injectable } from "@nestjs/common";

import { Flow } from "./model/flow.model";

@Injectable()
export class FlowService extends BaseService {
  constructor() {
    super();
  }

  async find(filter: FilterOptions<Flow>, opts?: ReadOpts): Promise<Flow[]> {
    const drizzleFilter = DrizzleFilterConverter.toFindMany(filter);
    const queryResult = await this.db(opts).query.flow.findMany(drizzleFilter);
    return queryResult.map((row) => new Flow(row));
  }
}