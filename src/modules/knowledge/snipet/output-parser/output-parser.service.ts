import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecuteSnipetDto } from "../dto/execute-snipet.dto";
import { ExecutionEvent } from "../types/execution-event";
import { Inject, Injectable } from "@nestjs/common";
import { AnswerOutputStrategy } from "./answer.parser";
import { SnipetIntent } from "@/types/snipet-intent";
import { SummarizeOutputStrategy } from "./summarize.parser";
import { ExpandOutputStrategy } from "./expand.parser";

@Injectable()
export class OutputParserService {
  @Inject() private readonly answerParser: AnswerOutputStrategy;
  @Inject() private readonly summarizeParser: SummarizeOutputStrategy;
  @Inject() private readonly expandParser: ExpandOutputStrategy;

  execute(executeSnipet: ExecuteSnipetDto, context: SnipetResolvedContext, subscriber: Subscriber<ExecutionEvent>) {
    switch(executeSnipet.intent) {
      case SnipetIntent.ANSWER:
        return this.answerParser.execute(executeSnipet, context, subscriber);
      case SnipetIntent.SUMMARIZE:
        return this.summarizeParser.execute(executeSnipet, context, subscriber);
      case SnipetIntent.EXPAND:
        return this.expandParser.execute(executeSnipet, context, subscriber);
      default:
        throw new Error(`Output parser not implemented for intent: ${executeSnipet.intent}`);
    }
  }
}