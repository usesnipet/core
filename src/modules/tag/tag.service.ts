import { Injectable } from "@nestjs/common";
import { BaseCrudService, type CrudIdentity } from "@/common/crud";
import { tag } from "@/db/schema/tag";
import { TagEntity } from "./tag.entity";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";

@Injectable()
export class TagService extends BaseCrudService<typeof tag, TagEntity, CreateTagDto, UpdateTagDto> {
  protected readonly identity: CrudIdentity<typeof tag> = {
    table: tag,
    idColumn: tag.id,
  };

  constructor() {
    super("tag", TagEntity);
  }
}

