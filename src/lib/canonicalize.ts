/**
 * @file Provides a function for canonicalizing strings, which is useful for cleaning up user input
 * or text from various sources to a consistent, standardized format.
 */

/**
 * Normalizes and cleans up a string by performing a series of transformations.
 * This is useful for creating a consistent representation of text before processing or storage.
 *
 * The steps are:
 * 1.  Unicode normalization to the "NFKC" form to handle visually similar characters.
 * 2.  Removal of zero-width space and other invisible characters.
 * 3.  Normalization of line endings from CRLF to LF.
 * 4.  Trimming of leading/trailing whitespace from each line.
 * 5.  Collapsing of three or more consecutive newlines into exactly two (to preserve paragraph breaks).
 * 6.  Collapsing of multiple spaces and tabs into a single space.
 * 7.  Trimming of leading/trailing whitespace from the entire string.
 *
 * @param input The string to canonicalize.
 * @returns The canonicalized string. Returns an empty string if the input is falsy.
 */
export function canonicalize(input: string): string {
  if (!input) return "";

  return input
    // Unicode normalization (remove weird variants)
    .normalize("NFKC")

    // Remove invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // Normalize line endings
    .replace(/\r\n/g, "\n")

    // Trim lines
    .split("\n")
    .map((line) => line.trim())
    .join("\n")

    // Collapse excessive newlines (but keep paragraphs)
    .replace(/\n{3,}/g, "\n\n")

    // Normalize whitespace (but keep single newlines)
    .replace(/[ \t]+/g, " ")

    // Final trim
    .trim();
}
