import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.decorator";
import type { Database } from "@/db";

@Injectable()
export class NodeService {
  constructor(@InjectDatabase() private readonly db: Database) {}
}
