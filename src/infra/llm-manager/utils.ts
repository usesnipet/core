import { encoding_for_model, get_encoding, TiktokenModel } from "tiktoken";

export function getUniversalEncoding(model: TiktokenModel | string) {
  try {
    return encoding_for_model(model as TiktokenModel);
  } catch {
    console.warn(`Failed to get encoding for model ${model}, falling back to cl100k_base`);
    return get_encoding("cl100k_base");
  }
}