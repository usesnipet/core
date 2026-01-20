/**
 * @file Contains utility functions for working with arrays.
 */

/**
 * Merges multiple arrays of objects into a single array, ensuring uniqueness based on a specified key.
 * If multiple objects have the same value for the given key, the last one encountered in the input arrays prevails.
 *
 * @template T The type of objects in the arrays.
 * @template K The key of the object to merge by.
 * @param {K} key The key to use for merging.
 * @param {...T[][]} lists The arrays of objects to merge.
 * @returns {T[]} A new array containing the merged, unique objects.
 *
 * @example
 * const arr1 = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
 * const arr2 = [{ id: 2, name: 'C' }, { id: 3, name: 'D' }];
 * const merged = mergeBy('id', arr1, arr2);
 * // merged will be [{ id: 1, name: 'A' }, { id: 2, name: 'C' }, { id: 3, name: 'D' }]
 */
export const mergeBy = <T, K extends keyof T>(key: K, ...lists: T[][]): T[] => {
  const map = new Map<T[K], T>();

  for (const item of lists.flat(1)) {
    map.set(item[key], item);
  }

  return [ ...map.values() ];
};
