/**
 * @file This file provides functionality to load and cache LLM (Large Language Model) presets.
 * Presets are loaded from JSON files located in the `llm-presets` directory.
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

import { __root } from "@/root";
import { LLMPreset } from "@/types/llm-preset";

/**
 * In-memory cache for the loaded LLM presets to avoid repeated file system access.
 * @type {LLMPreset[] | undefined}
 */
let presetsCache: LLMPreset[] | undefined = undefined;

/**
 * Resets the internal preset cache.
 * This is primarily used for testing purposes to ensure a clean state.
 * @private
 */
export const _resetCache = () => {
  presetsCache = undefined;
};

/**
 * Retrieves all LLM presets.
 *
 * On the first call, it reads all `.json` files from the `llm-presets` directory,
 * parses them, and validates them against the `LLMPreset` type.
 * The loaded presets are then cached in memory. Subsequent calls will return the cached data.
 * If any file fails to load or parse, an error is logged to the console, but the process continues.
 * If the directory cannot be read, an empty array is returned and cached.
 *
 * @returns {Promise<LLMPreset[]>} A promise that resolves to an array of LLM presets.
 */
export const getPresets = async (): Promise<LLMPreset[]> => {
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