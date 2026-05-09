import { Injectable } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";

import { DatabaseConfig } from "./database.interface";

@Injectable()
export class DatabaseService {
  public async getDrizzle(options: DatabaseConfig) {
    if (options.pg.connection === 'client') {
      const client = new Client(options.pg.config);
      await client.connect();
      return drizzle({ client, ...options?.config });
    }
    const pool = new Pool(options.pg.config);
    return drizzle({ client: pool, ...options?.config });
  }
}