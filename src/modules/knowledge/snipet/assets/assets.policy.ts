import { SnipetIntent } from "@/types/snipet-intent";
import { AnswerOutput } from "../output-parser/answer.parser";
import { SnipetAssetDto } from "../dto/snipet-asset.dto";
import { OutputParserResult } from "../output-parser/types";

export type AssetPolicy = {
  extractText: (asset: SnipetAssetDto) => string;
}

export const ASSET_POLICIES: Record<SnipetIntent, (asset: OutputParserResult) => string> = {
  [SnipetIntent.ANSWER]: (input: AnswerOutput) => input.answer,
  [SnipetIntent.SUMMARIZE]: (payload: AnswerOutput) => payload.answer,
  [SnipetIntent.EXPAND]: (payload: AnswerOutput) => payload.answer,
} as const;
