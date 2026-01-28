/**
 * @file This file exports a constant for the project's root directory path.
 */

import path from "path";

/**
 * The absolute path to the root directory of the project.
 * It is determined by resolving the current working directory (`process.cwd()`).
 * This provides a reliable anchor for accessing files and directories from anywhere in the application.
 *
 * @type {string}
 */
export const __root = path.resolve(process.cwd());
