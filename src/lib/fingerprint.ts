/**
 * @file Provides a utility for creating a deterministic fingerprint of a string.
 */

import { createHash } from "crypto";

/**
 * Generates a deterministic fingerprint (hash) for a given string.
 * This uses the SHA-256 algorithm to produce a unique and consistent hexadecimal string
 * for the same input text. It's useful for creating a stable identifier from content.
 *
 * @param text The input string to fingerprint.
 * @returns The SHA-256 hash of the input string, encoded as a hex string.
 */
export function fingerprint(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}