/**
 * @file Provides a utility function for introspecting class methods.
 */

/**
 * Retrieves all method names (excluding the constructor) from a given class instance or its prototype chain.
 * This function iterates up the prototype chain to collect methods defined at various levels.
 *
 * @param {any} target The class constructor or an instance of the class.
 * @returns {string[]} An array of strings, where each string is the name of a method.
 *
 * @example
 * class MyClass {
 *   methodA() {}
 *   methodB() {}
 * }
 * class AnotherClass extends MyClass {
 *   methodC() {}
 * }
 *
 * getAllClassMethods(new AnotherClass()); // ['methodC', 'methodA', 'methodB']
 * getAllClassMethods(AnotherClass);      // ['methodC', 'methodA', 'methodB']
 */
export const getAllClassMethods = (target: any): string[] => {
  const methods: string[] = [];
  let proto = target.prototype;
  while (proto && proto !== Object.prototype) {
    const methodNames = Object.getOwnPropertyNames(proto)
      .filter(
        (prop) =>
          typeof proto[prop] === "function" &&
          prop !== "constructor"
      );
    methods.push(...methodNames);
    proto = Object.getPrototypeOf(proto);
  }
  return methods;
};
