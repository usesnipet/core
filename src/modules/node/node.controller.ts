import { Controller } from "@nestjs/common";
import { InjectDatabase } from "../database/database.decorator";
import { schema } from "@/db";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { NodeService } from "./node.service";

@Controller('nodes')
export class NodeController {
  constructor(
    private readonly nodeService: NodeService
  ) {}

}
