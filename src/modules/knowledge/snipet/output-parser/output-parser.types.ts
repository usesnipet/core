import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecuteSnipetDto } from "../dto/execute-snipet.dto";
import { SnipetIntent } from "@/types/snipet-intent";
import { ExecutionEvent } from "../types/execution-event";
import { AnswerOutput } from "./answer.parser";
import { ExpandOutput } from "./expand.parser";
import { SummarizeOutput } from "./summarize.parser";

export type OutputParserResult = AnswerOutput | SummarizeOutput | ExpandOutput;

export interface OutputParserStrategy<T = OutputParserResult> {
  intent: SnipetIntent;

  execute(
    executeSnipet: ExecuteSnipetDto,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>
  ): Promise<T>;
}

