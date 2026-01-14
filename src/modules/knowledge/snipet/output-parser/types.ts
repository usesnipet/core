import { ProviderInfo } from "@/infra/llm-manager/provider/types";
import { Subscriber } from "rxjs";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";
import { SnipetIntent } from "@/types/snipet-intent";
import { ExecutionEvent } from "../types/execution-event";
import { AnswerOutput } from "./answer.parser";
import { ExecutionEntity } from "@/entities/execution.entity";

export type OutputParserResult = AnswerOutput;

export interface OutputParserStrategy<T = OutputParserResult> {
  intent: SnipetIntent;

  execute(
    execution: ExecutionEntity,
    context: SnipetResolvedContext,
    subscriber: Subscriber<ExecutionEvent>
  ): Promise<T>;
}

export type BaseOutputResult = {
  intent: SnipetIntent;
  modelInfo: ProviderInfo;
  tokens: {
    input: number;
    prompt: number;
    output: number;
  }
  time: {
    start: Date;
    end: Date;
  }
}