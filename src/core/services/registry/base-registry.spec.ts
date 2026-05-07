import "reflect-metadata";

import { IsString } from "class-validator";
import { BaseRegistry } from "./base-registry";

class TestItem {
  @IsString()
  id!: string;

  @IsString()
  name!: string;
}

class TestRegistry extends BaseRegistry<TestItem> {
  constructor() {
    super(TestItem);
  }
}

describe("BaseRegistry", () => {
  test("register stores validated item", async () => {
    const registry = new TestRegistry();

    const res = await registry.register({ id: "a", name: "A" });
    expect(res.isOk()).toBe(true);

    const getRes = registry.get("a");
    expect(getRes.isOk()).toBe(true);
    expect(getRes._unsafeUnwrap()).toEqual({ id: "a", name: "A" });
  });

  test("register rejects invalid item", async () => {
    const registry = new TestRegistry();

    // missing "name"
    const res = await registry.register({ id: "a" } as any);
    expect(res.isErr()).toBe(true);
    expect(res._unsafeUnwrapErr().message).toMatch(/TestItem is invalid/i);
  });

  test("get returns not found error", () => {
    const registry = new TestRegistry();
    const res = registry.get("missing");
    expect(res.isErr()).toBe(true);
    expect(res._unsafeUnwrapErr().message).toBe("TestItem not found: missing");
  });

  test("list returns all items", async () => {
    const registry = new TestRegistry();

    await registry.register({ id: "a", name: "A" });
    await registry.register({ id: "b", name: "B" });

    const res = registry.list();
    expect(res.isOk()).toBe(true);
    expect(res._unsafeUnwrap()).toEqual([{ id: "a", name: "A" }, { id: "b", name: "B" }]);
  });
});

