import { Field } from "@/shared/model";

export enum As {
  CHAT = "chat"
}

export class ReadMemoryAsDto {

  @Field({ type: "enum", enum: As, source: "query" })
  as: As;
}

export interface ReadMemoryAs<T> {
  items: T[];
}
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

  constructor(partial: ChatDto) {
    Object.assign(this, partial);
  }
}

export class ReadMemoryAsChatDto implements ReadMemoryAs<ChatDto> {
  @Field({ type: "class", class: () => ChatDto, isArray: true })
  items: ChatDto[];

  constructor(items: ChatDto[]) {
    this.items = items;
  }
}