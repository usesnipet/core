export function canonicalize(input: string): string {
  if (!input) return "";

  return input
    // Unicode normalization (remove weird variants)
    .normalize("NFKC")

    // Remove invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // Normalize line endings
    .replace(/\r\n/g, "\n")

    // Collapse excessive newlines (but keep paragraphs)
    .replace(/\n{3,}/g, "\n\n")

    // Normalize whitespace (but keep single newlines)
    .replace(/[ \t]+/g, " ")

    // Trim lines
    .split("\n")
    .map(line => line.trim())
    .join("\n")

    // Final trim
    .trim();
}
