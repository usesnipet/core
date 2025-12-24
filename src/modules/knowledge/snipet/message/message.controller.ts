import { Observable } from "rxjs";

import { SnipetMessageEntity } from "@/entities";
import { BaseController } from "@/shared/controller";
import { Controller, HttpPost } from "@/shared/controller/decorators";
import { HttpBody } from "@/shared/controller/decorators/body";
import { MessageEvent, Param, Query, Sse } from "@nestjs/common";
import { ApiOkResponse, ApiProduces } from "@nestjs/swagger";

import { SendMessageDto } from "./dto/send-message.dto";
import { SnipetMessageService } from "./message.service";

@Controller("knowledge/:knowledgeId/snippet/:snipetId/message")
export class SnipetMessageController extends BaseController({
  entity: SnipetMessageEntity,
  createDto: SendMessageDto
}) {
  constructor(public service: SnipetMessageService) {
    super(service);
  }

  @HttpPost()
  override create(@HttpBody(SendMessageDto) body: SendMessageDto): Promise<SnipetMessageEntity> {
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
    @Param("snipetId") snipetId: string,
    @Query("q") q: string,
  ): Promise<Observable<MessageEvent>> {
    const body = new SendMessageDto();
    body.content = q;
    body.snipetId = snipetId;
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