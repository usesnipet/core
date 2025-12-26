import { Inject, Injectable } from "@nestjs/common"
import { SnipetInput, SnipetOutput } from "./snipet.types"
import { SnipetEntity } from "@/entities"
import { ChatRuntime } from "./runtime/chat.runtime";

@Injectable()
export class SnipetExecutor {

  @Inject() private readonly chatRuntime: ChatRuntime;

  async execute(
    snipet: SnipetEntity,
    input: SnipetInput<any>
  ): Promise<SnipetOutput<any>> {
    switch(snipet.type) {
      case "chat":
        return this.chatRuntime.execute(input, { snipet });
      default:
        throw new Error(`Snipet type ${snipet.type} not supported`);
    }
  }
}
