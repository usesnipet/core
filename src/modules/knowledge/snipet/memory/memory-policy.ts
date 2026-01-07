import { MemoryType, SnipetMemoryEntity } from "@/entities";
import { OutputParserResult } from "../output-parser/output-parser.types";
import { AnswerOutput } from "../output-parser/answer.parser";
import { SummarizeOutput } from "../output-parser/summarize.parser";
import { ExpandOutput } from "../output-parser/expand.parser";
import { BadRequestException } from "@nestjs/common";
import { SnipetIntent } from "@/types/snipet-intent";

export const MEMORY_POLICIES = {
  [MemoryType.USER_INPUT]: {
    embed: true,
    extractText: (payload: string) => payload
  },
  [MemoryType.TEXT_ASSISTANT_OUTPUT]: {
    embed: true,
    extractText: (payload: OutputParserResult) => {
      switch (payload.intent) {
        case SnipetIntent.ANSWER:
          return (payload as AnswerOutput).answer;
        case SnipetIntent.SUMMARIZE:
          return (payload as SummarizeOutput).summary;
        case SnipetIntent.EXPAND:
          return (payload as ExpandOutput).expandedText;
        default:
          throw new BadRequestException("Invalid intent");
      }
    }
  }
} as const;

export const extractText = (memory: SnipetMemoryEntity) => MEMORY_POLICIES[memory.type].extractText(memory.payload);
