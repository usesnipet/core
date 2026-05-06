import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.decorator";
import type { Database } from "@/db";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { FlowEntity } from "./flow.entity";

@Injectable()
export class FlowService {
  constructor(
    @InjectDatabase() private readonly db: Database
  ) {}

  find(filter: FilterOptions<FlowEntity>) {
    return this.db.query.flow.findMany(DrizzleFilterConverter.toFindMany(filter));
  }
}
