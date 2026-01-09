import { buildOptions } from "./build-options";

describe("buildOptions", () => {
  interface TestOptions {
    a: number;
    b: string;
    c?: boolean;
  }

  const defaultOptions: TestOptions = {
    a: 1,
    b: "default",
  };

  it("should return default options if no modifier functions are provided", () => {
    const result = buildOptions(defaultOptions, []);
    expect(result).toEqual(defaultOptions);
  });

  it("should apply a single modifier function", () => {
    const modifier = (opts: TestOptions) => ({ ...opts, a: 2 });
    const result = buildOptions(defaultOptions, [modifier]);
    expect(result).toEqual({ a: 2, b: "default" });
  });

  it("should apply multiple modifier functions in order", () => {
    const modifier1 = (opts: TestOptions) => ({ ...opts, a: 2 });
    const modifier2 = (opts: TestOptions) => ({ ...opts, b: "modified" });
    const result = buildOptions(defaultOptions, [modifier1, modifier2]);
    expect(result).toEqual({ a: 2, b: "modified" });
  });

  it("should handle modifiers that return partial objects", () => {
    const modifier = () => ({ a: 100 });
    const result = buildOptions(defaultOptions, [modifier]);
    expect(result).toEqual({ a: 100, b: "default" });
  });

  it("should handle null or undefined in the modifier array", () => {
    const modifier = (opts: TestOptions) => ({ ...opts, a: 2 });
    const result = buildOptions(defaultOptions, [null, modifier, undefined] as any);
    expect(result).toEqual({ a: 2, b: "default" });
  });

  it("should not modify the default options object", () => {
    const modifier = (opts: TestOptions) => ({ ...opts, a: 2 });
    const defaultClone = { ...defaultOptions };
    buildOptions(defaultOptions, [modifier]);
    expect(defaultOptions).toEqual(defaultClone);
  });

  it("should pass the latest options to each modifier", () => {
    const modifier1 = (opts: TestOptions) => ({ ...opts, a: opts.a + 1 });
    const modifier2 = (opts: TestOptions) => ({ ...opts, a: opts.a * 2 });
    const result = buildOptions(defaultOptions, [modifier1, modifier2]);
    // a starts at 1, modifier1 makes it 2, modifier2 makes it 4
    expect(result.a).toBe(4);
  });
});
