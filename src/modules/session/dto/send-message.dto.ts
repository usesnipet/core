import { KnowledgeId } from "@/shared/controller/decorators";
import { Field } from "@/shared/model";

export class SendMessageDto {
  @Field({ type: "string", required: true, uuid: true, description: "The session id" })
  sessionId: string;

  @Field({ type: "string", required: true, description: "The message to send" })
  message: string;

  @KnowledgeId()
  knowledgeId: string;
}