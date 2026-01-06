import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { ExecuteSnipetDto } from "../dto/execute-snipet.dto";
import { SnipetIntent } from "@/types/snipet-intent";
import { ExecutionEvent } from "../types/execution-event";

export interface OutputParserStrategy<T = any> {
  intent: SnipetIntent;

  execute(
    executeSnipet: ExecuteSnipetDto,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>
  ): Promise<T>;
}