import { Observable } from "rxjs";

import { SessionMessageEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpPost } from "@/shared/controller/decorators";
import { HttpBody } from "@/shared/controller/decorators/body";
import { MessageEvent, Param, Query, Sse } from "@nestjs/common";
import { ApiOkResponse, ApiProduces } from "@nestjs/swagger";

import { SendMessageDto } from "./dto/send-message.dto";
import { SessionMessageService } from "./message.service";

@Controller("knowledge/:knowledgeId/session/:sessionId/message")
export class SessionMessageController extends BaseController({
  entity: SessionMessageEntity,
  createDto: SendMessageDto
}) {
  constructor(public service: SessionMessageService) {
    super(service);
  }

  @HttpPost()
  override create(@HttpBody(SendMessageDto) body: SendMessageDto): Promise<SessionMessageEntity> {
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
  @Sse('stream')
  async sendMessageStream(
    @Param("knowledgeId") knowledgeId: string,
    @Param("sessionId") sessionId: string,
    @Query("q") q: string,
  ): Promise<Observable<MessageEvent>> {
    const body = new SendMessageDto();
    body.content = q;
    body.sessionId = sessionId;
    body.knowledgeId = knowledgeId;
    const source$ = await this.service.sendMessageStream(body);
    return new Observable(subscriber => {
      const sub = source$.subscribe({
        next: (e) => subscriber.next(e),
        error: (e) => subscriber.error(e),
        complete: () => {
          subscriber.next({ data: "[DONE]" });
          subscriber.complete();
        }
      });

      return () => sub.unsubscribe();
    })
  }
}