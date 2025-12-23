import { FromParams, KnowledgeId } from "@/shared/controller/decorators";
import { Field } from "@/shared/model";

export class SendMessageDto {
  @Field({ type: "string", required: true, description: "The content of message to send" })
  content: string;

  @FromParams("sessionId")
  sessionId: string;

  @KnowledgeId()
  knowledgeId: string;
}