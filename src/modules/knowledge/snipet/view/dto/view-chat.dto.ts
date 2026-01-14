import { Field } from "@/shared/model";
import { ReferenceDto } from "./reference.dto";

export enum ChatRole {
  USER = "user",
  ASSISTANT = "assistant"
}

export class ChatDto {
  @Field({ type: "string", uuid: true, required: true })
  id: string;

  @Field({ type: "enum", enum: ChatRole })
  role: ChatRole;

  @Field({ type: "string", required: true, min: 1 })
  content: string;

  @Field({ type: "date", required: true })
  createdAt: Date;

  @Field({ type: "date", required: false })
  updatedAt?: Date;

  references?: ReferenceDto[];

  constructor(partial: ChatDto) {
    Object.assign(this, partial);
  }
}

export class ViewChatDto {
  @Field({ type: "class", class: () => ChatDto, isArray: true })
  items: ChatDto[];

  constructor(items: ChatDto[]) {
    this.items = items;
  }
}