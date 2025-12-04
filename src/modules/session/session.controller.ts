import { SessionEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller } from "@/shared/controller/decorators";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SessionService } from "./session.service";

@Controller("knowledge/:knowledgeId/session")
export class SessionController extends BaseController({
  entity: SessionEntity,
  createDto: CreateSessionDto
}) {
  constructor(public service: SessionService) {
    super(service);
  }
}