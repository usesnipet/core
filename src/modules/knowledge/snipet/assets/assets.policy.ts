import { SnipetIntent } from "@/types/snipet-intent";
import { OutputParserResult } from "../output-parser/output-parser.types";
import { AnswerOutput } from "../output-parser/answer.parser";

export type AssetPolicy = {
  persistText: boolean;
  embed: boolean;
  extractText: (input: OutputParserResult) => string;
}

export const ASSET_POLICIES: Record<SnipetIntent, AssetPolicy> = {
  [SnipetIntent.ANSWER]: {
    persistText: true,
    embed: true,
    extractText: (input: AnswerOutput) => input.answer,
  },
  [SnipetIntent.SUMMARIZE]: {
    persistText: true,
    embed: true,
    extractText: (payload: AnswerOutput) => {
      return payload.answer;
    },
  },
  [SnipetIntent.EXPAND]: {
    persistText: true,
    embed: false,
    extractText: (payload: AnswerOutput) => payload.answer,
  }
} as const;
