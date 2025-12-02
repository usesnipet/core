import { SessionEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpPost } from "@/shared/controller/decorators";

import { SessionService } from "./session.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { Param } from "@nestjs/common";
import { HttpBody } from "@/shared/controller/decorators/body";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("knowledge/:knowledgeId/session")
export class SessionController extends BaseController({
  entity: SessionEntity,
  createDto: CreateSessionDto
}) {
  constructor(public service: SessionService) {
    super(service);
  }

  @HttpPost(":id/message")
  sendMessage(@HttpBody(SendMessageDto) body: SendMessageDto) {
    return this.service.sendMessage(body);
  }
}