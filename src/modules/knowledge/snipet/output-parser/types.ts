import { ProviderInfo } from "@/infra/llm-manager/provider/types";
import { SnipetIntent } from "@/types/snipet-intent";

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