import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.decorator";
import { schema } from "@/db";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class FlowService {
  constructor(
    @InjectDatabase('default') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  find() {
    return this.db.query.flow.findMany();
  }
}
