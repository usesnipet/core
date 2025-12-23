import { SessionEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SessionService } from "./session.service";
import { Permission } from "@/lib/permissions";

@Controller("knowledge/:knowledgeId/session")
export class SessionController extends BaseController({
  entity: SessionEntity,
  createDto: CreateSessionDto,
  requiredPermissions: {
    create:   [Permission.CREATE_SESSION],
    update:   [Permission.UPDATE_SESSION],
    delete:   [Permission.DELETE_SESSION],
    find:     [Permission.READ_SESSION],
    findByID: [Permission.READ_SESSION]
  }
}) {
  constructor(public service: SessionService) {
    super(service);
  }
}