import { readdir, readFile } from "fs/promises";
import { join } from "path";

import { __root } from "@/root";
import { LLMPreset } from "@/types/llm-preset";

let presetsCache: LLMPreset[] | undefined = undefined;


export const getPresets = async () => {
  if (presetsCache) return presetsCache;
  
   try {
    const presetsPath = join(__root, "llm-presets");

    const dir = await readdir(presetsPath);
    const presets: LLMPreset[] = [];

    for (const file of dir.filter((f) => f.endsWith(".json"))) {
      const filePath = join(presetsPath, file);
      try {
        const content = await readFile(filePath, "utf8");
        const parsedData = JSON.parse(content) as any[];

        presets.push(...LLMPreset.fromObject(parsedData));
      } catch (err) {
        console.error(`Error loading preset ${file}:`, err);        
      }
    }
    presetsCache = presets || [];
  } catch (err) {
    presetsCache = [];
  }
  return presetsCache || [];
}