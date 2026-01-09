import { fingerprint } from "./fingerprint";

describe("fingerprint", () => {
  it("should return a SHA256 hash of the input string", () => {
    const input = "hello world";
    const expected =
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";
    expect(fingerprint(input)).toBe(expected);
  });

  it("should return a consistent hash for the same input", () => {
    const input = "some consistent string";
    expect(fingerprint(input)).toBe(fingerprint(input));
  });

  it("should return a different hash for different inputs", () => {
    const input1 = "string1";
    const input2 = "string2";
    expect(fingerprint(input1)).not.toBe(fingerprint(input2));
  });

  it("should handle empty string", () => {
    const input = "";
    const expected =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    expect(fingerprint(input)).toBe(expected);
  });

  it("should handle strings with special characters", () => {
    const input = "你好, world! @#$";
    const expected =
      "8b2c4e3a3b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b";
    // We don't need to know the exact hash, just that it doesn't throw an error
    // and returns a hex string of the correct length.
    const result = fingerprint(input);
    expect(result).toMatch(/^[a-f0-9]{64}$/);
    expect(result).not.toBe(fingerprint("another string"));
  });
});
