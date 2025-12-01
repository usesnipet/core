import { RoleEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class RoleService extends Service<RoleEntity> {
  logger = new Logger(RoleService.name);
  entity = RoleEntity;

}