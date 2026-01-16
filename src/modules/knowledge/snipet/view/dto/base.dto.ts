import { Field } from "@/shared/model";

export enum View {
  CHAT = "chat"
}

export class ViewDto {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;

  @Field({ type: "string", required: true, uuid: true, source: "params" })
  snipetId: string;

  @Field({ type: "enum", enum: View, source: "query" })
  view: View;
}