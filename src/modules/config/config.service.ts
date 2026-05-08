import { Injectable } from "@nestjs/common";
import { BaseCrudService, type CrudIdentity } from "@/common/crud";
import { config } from "@/db/schema/config";
import { ConfigEntity } from "./config.entity";
import { CreateConfigDto } from "./dto/create-config.dto";
import { UpdateConfigDto } from "./dto/update-config.dto";

@Injectable()
export class ConfigService extends BaseCrudService<typeof config, ConfigEntity, CreateConfigDto, UpdateConfigDto> {
  protected readonly identity: CrudIdentity<typeof config> = {
    table: config,
    idColumn: config.id,
  };

  constructor() {
    super("config", ConfigEntity);
  }
}

