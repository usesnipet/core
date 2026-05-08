import { Injectable } from "@nestjs/common";
import { BaseCrudService, CreateOpts, type CrudIdentity } from "@/common/crud";
import { addTags, removeTags, TagJoinSpec } from "@/common/tags";
import { config } from "@/db/schema/config";
import { configTag } from "@/db/schema/entity-tags";
import { ConfigEntity } from "./config.entity";
import { CreateConfigDto } from "./dto/create-config.dto";
import { UpdateConfigDto } from "./dto/update-config.dto";

@Injectable()
export class ConfigService extends BaseCrudService<typeof config, ConfigEntity, CreateConfigDto, UpdateConfigDto> {
  protected readonly identity: CrudIdentity<typeof config> = {
    table: config,
    idColumn: config.id,
  };

  private readonly tagsSpec: TagJoinSpec<typeof configTag> = {
    joinTable: configTag,
    ownerIdColumn: configTag.configId,
    ownerIdField: "configId",
  };

  constructor() {
    super("config", ConfigEntity);
  }

  async addTags(configId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await addTags(this.db(opts), this.tagsSpec, configId, tags);
  }

  async removeTags(configId: string, tags: string[], opts: CreateOpts): Promise<void> {
    await removeTags(this.db(opts), this.tagsSpec, configId, tags);
  }
}

