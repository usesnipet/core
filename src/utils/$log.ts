/**
 * @file Contains a utility function for logging values, primarily for debugging purposes.
 */

import { Logger, LogLevel } from "@nestjs/common";

/**
 * A debugging utility that logs a value and then returns it.
 * This is useful for inspecting a value in the middle of a chain of operations without breaking the flow.
 *
 * @example
 * const result = someArray
 *   .map(transform)
 *   .$log() // Logs the array after the map operation
 *   .filter(predicate);
 *
 * @template T The type of the value being logged.
 * @param {T} value The value to log.
 * @param {object} [options] Optional configuration for logging.
 * @param {LogLevel} [options.type='log'] The log level to use (e.g., 'log', 'warn', 'error').
 * @param {Logger} [options.logger=new Logger()] The NestJS logger instance to use.
 * @param {boolean} [options.enabled=true] Whether the log is enabled. If false, the function just returns the value.
 * @returns {T} The original value that was passed in.
 */
export const $log = <T = any>(value: T, options: { type?: LogLevel; logger?: Logger; enabled?: boolean } = {}): T => {
  if (options.enabled === false) return value;

  const { type = 'log', logger = new Logger() } = options;
  logger[type](value);
  return value;
};
