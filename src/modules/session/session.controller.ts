import { Observable } from "rxjs";

import { SessionEntity, SessionMessageEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpPost } from "@/shared/controller/decorators";
import { HttpBody } from "@/shared/controller/decorators/body";
import { MessageEvent, Param, Query, Sse } from "@nestjs/common";
import { ApiOkResponse, ApiProduces } from "@nestjs/swagger";

import { CreateSessionDto } from "./dto/create-session.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { SessionService } from "./session.service";

@Controller("knowledge/:knowledgeId/session")
export class SessionController extends BaseController({
  entity: SessionEntity,
  createDto: CreateSessionDto
}) {
  constructor(public service: SessionService) {
    super(service);
  }

  @HttpPost("message")
  sendMessage(
    @HttpBody(SendMessageDto) body: SendMessageDto
  ): Promise<SessionMessageEntity> {
    return this.service.sendMessage(body);
  }

  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    description: 'SSE stream',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: `data: hello\n\ndata: world\n\n`,
        },
      },
    },
  })
  @Sse(':id/message/stream')
  async sendMessageStream(
    @Param("knowledgeId") knowledgeId: string,
    @Param("id") id: string,
    @Query("q") q: string,
  ): Promise<Observable<MessageEvent>> {
    const body = new SendMessageDto();
    body.knowledgeId = knowledgeId;
    body.message = q;
    body.sessionId = id;
    return this.service.sendMessageStream(body);
  }
}