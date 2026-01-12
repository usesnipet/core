import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecuteSnipetDto } from "../dto/execute-snipet.dto";
import { ExecutionEvent } from "../types/execution-event";
import { Inject, Injectable } from "@nestjs/common";
import { AnswerOutputStrategy } from "./answer.parser";
import { SnipetIntent } from "@/types/snipet-intent";
import { ExecutionEntity } from "@/entities/execution.entity";

@Injectable()
export class OutputParserService {
  @Inject() private readonly answerParser: AnswerOutputStrategy;

  execute(
    execution: ExecutionEntity,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>
  ) {
    switch(execution.options.intent) {
      case SnipetIntent.ANSWER:
        return this.answerParser.execute(execution, context, subscriber);
      default:
        throw new Error(`Output parser not implemented for intent: ${execution.options.intent}`);
    }
  }
}