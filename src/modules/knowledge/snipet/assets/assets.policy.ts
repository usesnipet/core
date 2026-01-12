import { SnipetAssetType } from "../dto/snipet-asset.dto";
import { SnipetIntent } from "@/types/snipet-intent";
import { OutputParserResult } from "../output-parser/output-parser.types";

export const ASSET_POLICIES: Record<SnipetAssetType, { persistText: boolean; embed: boolean; extractText: (input: string | OutputParserResult) => string; role: string }> = {
  [SnipetAssetType.USER_QUESTION]: {
    persistText: true,
    embed: true,
    extractText: (input: string) => input,
    role: "user"
  },
  [SnipetAssetType.AI_RESPONSE]: {
    persistText: true,
    embed: true,
    extractText: (payload: OutputParserResult) => {
      switch (payload.intent) {
        case SnipetIntent.ANSWER:
          return payload.answer;
      }
    },
    role: "assistant"
  },
  [SnipetAssetType.PROMPT]: {
    persistText: true,
    embed: false,
    extractText: (input: string) => input,
    role: "system"
  },
  [SnipetAssetType.SEARCH_QUERY]: {
    persistText: true,
    embed: false,
    extractText: (input: string) => input,
    role: "system"
  },
  [SnipetAssetType.SEARCH_RESULT]: {
    persistText: true,
    embed: false,
    extractText: (input: string) => input,
    role: "system"
  }
} as const;
