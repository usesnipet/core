/**
 * @file Provides utility functions for validating UUIDs.
 */

import { z } from "zod";

/**
 * Checks if a given string is a valid UUID (Universally Unique Identifier).
 * It uses the `zod` library for robust schema validation.
 *
 * @param {string} value The string to validate.
 * @returns {boolean} `true` if the string is a valid UUID, `false` otherwise.
 */
export const isUUID = (value: string): boolean => {
  const res = z.uuid().safeParse(value);
  return res.success;
};
