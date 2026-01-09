import { mergeBy } from "./array";

describe("mergeBy", () => {
  interface TestObject {
    id: number;
    value: string;
  }

  it("should merge two arrays with no duplicates", () => {
    const list1: TestObject[] = [
      { id: 1, value: "a" },
      { id: 2, value: "b" },
    ];
    const list2: TestObject[] = [
      { id: 3, value: "c" },
      { id: 4, value: "d" },
    ];
    const result = mergeBy("id", list1, list2);
    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining([...list1, ...list2]));
  });

  it("should merge two arrays with duplicates, ensuring the last one wins", () => {
    const list1: TestObject[] = [
      { id: 1, value: "a" },
      { id: 2, value: "b" },
    ];
    const list2: TestObject[] = [
      { id: 2, value: "c" },
      { id: 3, value: "d" },
    ];
    const result = mergeBy("id", list1, list2);
    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        { id: 1, value: "a" },
        { id: 2, value: "c" },
        { id: 3, value: "d" },
      ])
    );
  });

  it("should merge multiple arrays", () => {
    const list1: TestObject[] = [{ id: 1, value: "a" }];
    const list2: TestObject[] = [{ id: 2, value: "b" }];
    const list3: TestObject[] = [{ id: 3, value: "c" }];
    const result = mergeBy("id", list1, list2, list3);
    expect(result).toHaveLength(3);
  });

  it("should handle empty arrays", () => {
    const list1: TestObject[] = [
      { id: 1, value: "a" },
      { id: 2, value: "b" },
    ];
    const result = mergeBy("id", list1, []);
    expect(result).toHaveLength(2);
    expect(result).toEqual(list1);
  });

  it("should return an empty array if all input arrays are empty", () => {
    const result = mergeBy("id", [], [], []);
    expect(result).toHaveLength(0);
  });

  it("should handle objects with different properties but the same key", () => {
    const list1 = [{ id: 1, name: "one" }];
    const list2 = [{ id: 1, value: "uno" }];
    const result = mergeBy<any, string>("id", list1 as any, list2 as any);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 1, value: "uno" });
  });

  it("should not modify the original arrays", () => {
    const list1: TestObject[] = [
      { id: 1, value: "a" },
      { id: 2, value: "b" },
    ];
    const list2: TestObject[] = [
      { id: 2, value: "c" },
      { id: 3, value: "d" },
    ];
    const list1Clone = [...list1];
    const list2Clone = [...list2];
    mergeBy("id", list1, list2);
    expect(list1).toEqual(list1Clone);
    expect(list2).toEqual(list2Clone);
  });
});
