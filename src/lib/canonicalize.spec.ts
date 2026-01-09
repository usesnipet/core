import { canonicalize } from "./canonicalize";

describe("canonicalize", () => {
  it("should return an empty string if input is empty", () => {
    expect(canonicalize("")).toBe("");
  });

  it("should normalize Unicode characters", () => {
    const input = "K\u0063\u0327"; // "Kç"
    const expected = "K\u00E7"; // "Kç"
    expect(canonicalize(input)).toBe(expected.normalize("NFKC"));
  });

  it("should remove invisible characters", () => {
    const input = "hello\u200Bworld";
    const expected = "helloworld";
    expect(canonicalize(input)).toBe(expected);
  });

  it("should normalize line endings", () => {
    const input = "hello\r\nworld";
    const expected = "hello\nworld";
    expect(canonicalize(input)).toBe(expected);
  });

  it("should collapse excessive newlines", () => {
    const input = "hello\n\n\nworld";
    const expected = "hello\n\nworld";
    expect(canonicalize(input)).toBe(expected);
  });

  it("should normalize whitespace", () => {
    const input = "hello   world";
    const expected = "hello world";
    expect(canonicalize(input)).toBe(expected);
  });

  it("should trim lines", () => {
    const input = "  hello  \n  world  ";
    const expected = "hello\nworld";
    expect(canonicalize(input)).toBe(expected);
  });

  it("should perform a combination of normalizations", () => {
    const input =
      "  leading\u200B and trailing spaces  \n\n\nand   multiple\t spaces\r\nand invisible chars\u200C";
    const expected =
      "leading and trailing spaces\n\nand multiple spaces\nand invisible chars";
    expect(canonicalize(input)).toBe(expected);
  });

  it("should handle complex cases", () => {
    const input =
      "\n\n  Line 1 with trailing spaces.   \r\n\r\n  \n  Line 2 with  many   spaces.  \n\n  \tLine 3 with tabs.\t\n\n";
    const expected =
      "Line 1 with trailing spaces.\n\nLine 2 with many spaces.\n\nLine 3 with tabs.";
    expect(canonicalize(input)).toBe(expected);
  });
});
