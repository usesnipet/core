import { getAllClassMethods } from "./get-all-class-methods";

describe("getAllClassMethods", () => {
  class SimpleClass {
    method1() {}
    method2() {}
  }

  class ChildClass extends SimpleClass {
    method3() {}
  }

  class EmptyClass {}

  class ClassWithNoMethods {
    property1 = "hello";
  }

  it("should get all methods from a simple class", () => {
    const methods = getAllClassMethods(SimpleClass);
    expect(methods).toHaveLength(2);
    expect(methods).toEqual(expect.arrayContaining(["method1", "method2"]));
  });

  it("should get all methods from a class and its parent", () => {
    const methods = getAllClassMethods(ChildClass);
    expect(methods).toHaveLength(3);
    expect(methods).toEqual(
      expect.arrayContaining(["method1", "method2", "method3"])
    );
  });

  it("should return an empty array for a class with no methods", () => {
    const methods = getAllClassMethods(EmptyClass);
    expect(methods).toHaveLength(0);
  });

  it("should not include non-function properties", () => {
    const methods = getAllClassMethods(ClassWithNoMethods);
    expect(methods).toHaveLength(0);
  });

  it("should not include the constructor", () => {
    const methods = getAllClassMethods(SimpleClass);
    expect(methods).not.toContain("constructor");
  });

  it("should handle plain objects gracefully", () => {
    const obj = {
      method1: () => {},
    };
    const methods = getAllClassMethods(obj);
    expect(methods).toHaveLength(0);
  });

  it("should handle built-in types", () => {
    const methods = getAllClassMethods(String);
    // This will get all String.prototype methods.
    // We can just check for a few known ones.
    expect(methods).toContain("slice");
    expect(methods).toContain("trim");
  });
});
