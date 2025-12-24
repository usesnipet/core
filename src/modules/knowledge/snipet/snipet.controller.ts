import { SnipetEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";
import { CreateSnipetDto } from "./dto/create-snipet.dto";
import { SnipetService } from "./snipet.service";
import { Permission } from "@/lib/permissions";

@Controller("knowledge/:knowledgeId/snipet")
export class SnipetController extends BaseController({
  entity: SnipetEntity,
  createDto: CreateSnipetDto,
  requiredPermissions: {
    create:   [Permission.CREATE_SNIPET],
    update:   [Permission.UPDATE_SNIPET],
    delete:   [Permission.DELETE_SNIPET],
    find:     [Permission.READ_SNIPET],
    findByID: [Permission.READ_SNIPET]
  }
}) {
  constructor(public service: SnipetService) {
    super(service);
  }
}